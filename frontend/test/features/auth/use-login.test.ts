import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LOGIN_MUTATION } from '@/features/auth/api/auth.mutations';
import { useLogin } from '@/features/auth/hooks/use-login';

import { makeAuthContext, createWrapper } from '../../utils';
import { makeUser } from '../../mocks/data';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', async importActual => {
  const mod = await importActual<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

const user = makeUser();
const token = 'access-token';

const successMock = {
  request: {
    query: LOGIN_MUTATION,
    variables: { loginRequest: { email: 'test@example.com', password: 'password123' } },
  },
  result: {
    data: {
      login: { code: 200, message: 'OK', success: true, accessToken: token, user },
    },
  },
};

const failureMock = {
  request: {
    query: LOGIN_MUTATION,
    variables: { loginRequest: { email: 'test@example.com', password: 'wrongpassword' } },
  },
  result: {
    data: {
      login: { code: 401, message: 'Invalid credentials', success: false, accessToken: null, user: null },
    },
  },
};

describe('useLogin', () => {
  it('starts with loading=false and no error', () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper({ mocks: [successMock] }),
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('calls auth.login and navigates to "/" on success', async () => {
    const authContext = makeAuthContext();
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper({ mocks: [successMock], authContext }),
    });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    await waitFor(() => {
      expect(authContext.login).toHaveBeenCalledWith(user, token);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('returns error message when API responds with success=false', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper({ mocks: [failureMock] }),
    });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'wrongpassword' });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  it('does not navigate when login fails', async () => {
    mockNavigate.mockClear();
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper({ mocks: [failureMock] }),
    });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'wrongpassword' });
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
