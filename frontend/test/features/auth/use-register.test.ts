import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';

import { REGISTER_MUTATION } from '@/features/auth/api/auth.mutations';
import { useRegister } from '@/features/auth/hooks/use-register';

import { createWrapper } from '../../utils';

const registerInput = {
  username: 'newuser',
  email: 'new@example.com',
  password: 'StrongPass1!',
  confirmPassword: 'StrongPass1!',
};

const registerSuccessMock = {
  request: {
    query: REGISTER_MUTATION,
    variables: { registerRequest: registerInput },
  },
  result: {
    data: { register: true },
  },
};

const registerFailureMock = {
  request: {
    query: REGISTER_MUTATION,
    variables: { registerRequest: registerInput },
  },
  result: {
    errors: [new GraphQLError('Email already in use', { extensions: { code: 'CONFLICT' } })],
  },
};

describe('useRegister', () => {
  it('starts with loading=false, no error, and no submittedEmail', () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerSuccessMock] }),
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.submittedEmail).toBeNull();
  });

  it('sets submittedEmail after successful registration', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerSuccessMock] }),
    });

    await act(async () => {
      await result.current.register(registerInput);
    });

    await waitFor(() => {
      expect(result.current.submittedEmail).toBe(registerInput.email);
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
      expect(result.current.error).toBeDefined();
    });
  });

  it('does not set submittedEmail when registration fails', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper({ mocks: [registerFailureMock] }),
    });

    await act(async () => {
      await result.current.register(registerInput);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    expect(result.current.submittedEmail).toBeNull();
  });
});
