import { useQuery } from '@apollo/client/react';

import { VALIDATE_PASSWORD_RESET_TOKEN_QUERY } from '../api/auth.queries';
import type { ValidatePasswordResetTokenResponse } from '../api/auth.types';

export function useValidatePasswordResetToken(token: string | null) {
  const { data, loading, error } = useQuery<ValidatePasswordResetTokenResponse>(VALIDATE_PASSWORD_RESET_TOKEN_QUERY, {
    variables: { token },
    skip: !token,
  });

  const isValid = data?.validatePasswordResetToken.success === true;

  return { isValid, loading, error };
}
