import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/shared/lib/utils';

import { REGISTER_MUTATION } from '../api/auth.mutations';
import type { RegisterRequest, RegisterResponse } from '../api/auth.types';

type UseRegisterResult = {
  register: (input: RegisterRequest) => Promise<void>;
  loading: boolean;
  error: string | undefined;
  data: RegisterResponse;
};

export function useRegister(): UseRegisterResult {
  const [registerMutation, { loading, error, data }] = useMutation<RegisterResponse>(REGISTER_MUTATION);

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);

  const register = async (input: RegisterRequest) => {
    await registerMutation({ variables: { registerRequest: input } });
  };

  return { register, loading, error: errorMessage, data };
}
