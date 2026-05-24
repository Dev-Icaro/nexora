import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GET_PROFILE } from '@/features/profile/api/profile.queries';
import { UPDATE_PROFILE_MUTATION } from '@/features/profile/api/profile.mutations';
import { useProfile } from '@/features/profile/hooks/use-profile';

import { createWrapper, makeAuthContext } from '../../utils';
import { makeProfileUser } from '../../mocks/data';

vi.mock('@/shared/lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const profileUser = makeProfileUser();

function profileQueryMock(userId = 'user-1') {
  return {
    request: { query: GET_PROFILE, variables: { userId } },
    result: { data: { getUserById: profileUser } },
  };
}

function updateMutationMock(success: boolean, message = 'OK') {
  return {
    request: {
      query: UPDATE_PROFILE_MUTATION,
      variables: { updateProfileRequest: { bio: 'New bio' } },
    },
    result: {
      data: {
        updateProfile: {
          code: success ? 200 : 400,
          message,
          success,
          user: success ? profileUser : null,
        },
      },
    },
  };
}

describe('useProfile', () => {
  it('starts loading while fetching profile data', () => {
    const { result } = renderHook(() => useProfile('user-1'), {
      wrapper: createWrapper({ mocks: [profileQueryMock()] }),
    });
    expect(result.current.loading).toBe(true);
  });

  it('returns user data after query resolves', async () => {
    const { result } = renderHook(() => useProfile('user-1'), {
      wrapper: createWrapper({ mocks: [profileQueryMock()] }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.username).toBe('testuser');
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('returns storage info alongside the user', async () => {
    const { result } = renderHook(() => useProfile('user-1'), {
      wrapper: createWrapper({ mocks: [profileQueryMock()] }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.storageInfo?.quotaBytes).toBe(104_857_600);
  });

  it('returns error message when query fails', async () => {
    const errorMock = {
      request: { query: GET_PROFILE, variables: { userId: 'user-1' } },
      error: new Error('Not found'),
    };
    const { result } = renderHook(() => useProfile('user-1'), {
      wrapper: createWrapper({ mocks: [errorMock] }),
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });
  });

  it('updateProfile returns true on success', async () => {
    const authContext = makeAuthContext();
    const { result } = renderHook(() => useProfile('user-1'), {
      wrapper: createWrapper({
        mocks: [profileQueryMock(), updateMutationMock(true)],
        authContext,
      }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateProfile({ bio: 'New bio' });
    });

    expect(ok).toBe(true);
  });

  it('updateProfile returns false when API responds with success=false', async () => {
    const { result } = renderHook(() => useProfile('user-1'), {
      wrapper: createWrapper({
        mocks: [profileQueryMock(), updateMutationMock(false, 'Validation failed')],
      }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.updateProfile({ bio: 'New bio' });
    });

    expect(ok).toBe(false);
  });
});
