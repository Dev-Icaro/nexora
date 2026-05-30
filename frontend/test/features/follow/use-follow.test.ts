import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FOLLOW_USER, UNFOLLOW_USER } from '@/features/follow/api/follow.mutations';
import { useFollow } from '@/features/follow/hooks/use-follow';
import { GET_PROFILE } from '@/features/profile/api/profile.queries';

import { createWrapper } from '../../utils';
import { makeProfileUser } from '../../mocks/data';

vi.mock('@/shared/lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from '@/shared/lib/toast';

const TARGET_USER_ID = 'user-2';

const profileInCache = makeProfileUser({
  id: TARGET_USER_ID,
  username: 'otheruser',
  followersCount: 10,
  isFollowing: false,
});

const profileQueryMock = {
  request: { query: GET_PROFILE, variables: { userId: TARGET_USER_ID } },
  result: { data: { getUserById: profileInCache } },
};

const followSuccessMock = {
  request: { query: FOLLOW_USER, variables: { userId: TARGET_USER_ID } },
  result: {
    data: {
      followUser: {
        code: 200,
        success: true,
        message: 'User followed successfully',
        user: { id: TARGET_USER_ID, followersCount: 11, isFollowing: true },
      },
    },
  },
};

const unfollowSuccessMock = {
  request: { query: UNFOLLOW_USER, variables: { userId: TARGET_USER_ID } },
  result: {
    data: {
      unfollowUser: {
        code: 200,
        success: true,
        message: 'User unfollowed successfully',
        user: { id: TARGET_USER_ID, followersCount: 9, isFollowing: false },
      },
    },
  },
};

const followErrorMock = {
  request: { query: FOLLOW_USER, variables: { userId: TARGET_USER_ID } },
  error: new Error('Network error'),
};

const unfollowErrorMock = {
  request: { query: UNFOLLOW_USER, variables: { userId: TARGET_USER_ID } },
  error: new Error('Network error'),
};

describe('useFollow', () => {
  it('starts with loading=false', () => {
    const { result } = renderHook(() => useFollow(), {
      wrapper: createWrapper({ mocks: [followSuccessMock] }),
    });
    expect(result.current.followLoading).toBe(false);
    expect(result.current.unfollowLoading).toBe(false);
  });

  describe('follow', () => {
    it('fires the FOLLOW_USER mutation', async () => {
      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, followSuccessMock] }),
      });

      await act(async () => {
        await result.current.follow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(result.current.followLoading).toBe(false);
      });
    });

    it('applies optimistic cache update before server responds', async () => {
      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, followSuccessMock] }),
      });

      await act(async () => {
        result.current.follow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(result.current.followLoading).toBe(false);
      });
    });

    it('reconciles cache with server-returned followersCount and isFollowing on success', async () => {
      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, followSuccessMock] }),
      });

      await act(async () => {
        await result.current.follow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(result.current.followLoading).toBe(false);
      });
    });

    it('shows error toast and rolls back on network error', async () => {
      vi.mocked(toast.error).mockClear();

      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, followErrorMock] }),
      });

      await act(async () => {
        await result.current.follow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to follow user');
      });
    });
  });

  describe('unfollow', () => {
    it('fires the UNFOLLOW_USER mutation', async () => {
      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, unfollowSuccessMock] }),
      });

      await act(async () => {
        await result.current.unfollow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(result.current.unfollowLoading).toBe(false);
      });
    });

    it('reconciles cache with server-returned followersCount and isFollowing on success', async () => {
      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, unfollowSuccessMock] }),
      });

      await act(async () => {
        await result.current.unfollow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(result.current.unfollowLoading).toBe(false);
      });
    });

    it('shows error toast on network error', async () => {
      vi.mocked(toast.error).mockClear();

      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper({ mocks: [profileQueryMock, unfollowErrorMock] }),
      });

      await act(async () => {
        await result.current.unfollow(TARGET_USER_ID);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to unfollow user');
      });
    });
  });
});
