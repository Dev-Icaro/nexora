import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LOGIN_MUTATION, REGISTER_MUTATION } from '@/features/auth/api/auth.mutations';
import { useRegister } from '@/features/auth/hooks/use-register';

import { makeAuthContext, createWrapper } from '../../utils';
import { makeUser } from '../../mocks/data';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', async importActual => {
  const mod = await importActual<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

const user = makeUser();
const registerInput = { username: 'newuser', email: 'new@example.com', password: 'StrongPass1!' };

const registerSuccessMock = {
  request: {
    query: REGISTER_MUTATION,
    variables: { registerRequest: registerInput },
  },
  result: {
    data: { register: { code: 201, message: 'Created', success: true } },
  },
};

const registerFailureMock = {
  request: {
    query: REGISTER_MUTATION,
    variables: { registerRequest: registerInput },
  },
  result: {
    data: { register: { code: 409, message: 'Email already in use', success: false } },
  },
};

const loginSuccessMock = {
  request: {
    query: LOGIN_MUTATION,
    variables: { loginRequest: { email: registerInput.email, password: registerInput.password } },
  },
  result: {
    data: {
      login: { code: 200, message: 'OK', success: true, accessToken: 'access-token', user },
    },
  },
};

describe('useRegister', () => {
  it('starts with loading=false and no error', () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerSuccessMock, loginSuccessMock] }),
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('auto-logs in and navigates after successful registration', async () => {
    const authContext = makeAuthContext();
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerSuccessMock, loginSuccessMock], authContext }),
    });

    await act(async () => {
      await result.current.register(registerInput);
    });

    await waitFor(() => {
      expect(authContext.login).toHaveBeenCalledWith(user, 'access-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('returns error message when registration fails', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerFailureMock] }),
    });

    await act(async () => {
      await result.current.register(registerInput);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Email already in use');
    });
  });

  it('does not attempt login when registration fails', async () => {
    mockNavigate.mockClear();
    const authContext = makeAuthContext();
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerFailureMock], authContext }),
    });

    await act(async () => {
      await result.current.register(registerInput);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    expect(authContext.login).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
