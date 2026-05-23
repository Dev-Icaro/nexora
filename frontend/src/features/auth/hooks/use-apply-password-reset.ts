import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/shared/lib/utils';

import { APPLY_PASSWORD_RESET_MUTATION } from '../api/auth.mutations';

type UseApplyPasswordResetResult = {
  applyReset: (token: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  loading: boolean;
  error: string | undefined;
};

export function useApplyPasswordReset(): UseApplyPasswordResetResult {
  const [mutate, { loading, error, data }] = useMutation(APPLY_PASSWORD_RESET_MUTATION);

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);

  const applyReset = async (token: string, newPassword: string, confirmPassword: string): Promise<boolean> => {
    const result = await mutate({
      variables: { applyPasswordResetRequest: { token, newPassword, confirmPassword } },
    });
    return result.data?.applyPasswordReset.success === true;
  };

  return { applyReset, loading, error: errorMessage };
}
