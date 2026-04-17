import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/shared/lib/utils';

import { REGISTER_MUTATION } from '../api/auth.mutations';
import type { RegisterRequest, RegisterResponse } from '../api/auth.types';
import { useLogin } from './use-login';

type UseRegisterResult = {
  register: (input: RegisterRequest) => Promise<void>;
  loading: boolean;
  error: string | undefined;
  data: RegisterResponse | null | undefined;
};

export function useRegister(): UseRegisterResult {
  const [registerMutation, { loading, error, data }] = useMutation<RegisterResponse>(REGISTER_MUTATION);
  const { login } = useLogin();

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);

  const register = async (input: RegisterRequest) => {
    const { data: response } = await registerMutation({ variables: { registerRequest: input } });

    if (response?.register.success) {
      await login({ email: input.email, password: input.password });
    }
  };

  return { register, loading, error: errorMessage, data };
}
