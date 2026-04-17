import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
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
  const navigate = useNavigate();
  const [loginMutation, { loading, error, data }] = useMutation<LoginResponse>(LOGIN_MUTATION);

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);

  const login = async (input: LoginRequest) => {
    const { data: response } = await loginMutation({ variables: { loginRequest: input } });
    const loginData = response?.login;

    if (loginData?.success && loginData.user && loginData.accessToken) {
      auth.login(loginData.user, loginData.accessToken);
      navigate('/');
    }
  };

  return { login, loading, error: errorMessage };
}
