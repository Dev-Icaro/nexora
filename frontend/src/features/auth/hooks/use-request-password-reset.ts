import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/shared/lib/utils';

import { REQUEST_PASSWORD_RESET_MUTATION } from '../api/auth.mutations';
import type { RequestPasswordResetResponse } from '../api/auth.types';

type UseRequestPasswordResetResult = {
  requestReset: (email: string) => Promise<void>;
  loading: boolean;
  error: string | undefined;
  isSuccess: boolean;
};

export function useRequestPasswordReset(): UseRequestPasswordResetResult {
  const [mutate, { loading, error, data }] = useMutation<RequestPasswordResetResponse>(REQUEST_PASSWORD_RESET_MUTATION);

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);
  const isSuccess = data?.requestPasswordReset.success === true;

  const requestReset = async (email: string) => {
    await mutate({ variables: { requestPasswordResetRequest: { email } } });
  };

  return { requestReset, loading, error: errorMessage, isSuccess };
}
