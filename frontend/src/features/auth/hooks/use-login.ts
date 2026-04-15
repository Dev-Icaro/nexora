import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';

import { useAuth } from '@/features/auth/state/auth-context';
import { getApiErrorMessage } from '@/shared/lib/utils';

import { LOGIN_MUTATION } from '../api/auth.mutations';
import type { LoginRequest, LoginResponse } from '../api/auth.types';

type UseLoginResult = {
  login: (input: LoginRequest) => Promise<void>;
  loading: boolean;
  error: string | undefined;
};

export function useLogin(): UseLoginResult {
  const auth = useAuth();
  const [loginMutation, { loading, error, data }] = useMutation<LoginResponse>(LOGIN_MUTATION);

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);

  const login = async (input: LoginRequest) => {
    const { data: response } = await loginMutation({ variables: { loginRequest: input } });
    const loginData = response?.login;

    if (loginData?.success && loginData.user && loginData.accessToken) {
      auth.login(loginData.user, loginData.accessToken);
    }
  };

  return { login, loading, error: errorMessage };
}
