import { useMutation } from '@apollo/client/react';

import type { VerifyEmailMutation } from '@/gql/graphql';

import { VERIFY_EMAIL_MUTATION } from '../api/auth.mutations';

type VerifyEmailResult = {
  user: NonNullable<NonNullable<VerifyEmailMutation['verifyEmail']>['user']>;
  accessToken: string;
};

type UseVerifyEmailResult = {
  verify: (token: string) => Promise<VerifyEmailResult | null>;
  loading: boolean;
  error: string | undefined;
};

export function useVerifyEmail(): UseVerifyEmailResult {
  const [verifyMutation, { loading, error }] = useMutation(VERIFY_EMAIL_MUTATION);

  const verify = async (token: string): Promise<VerifyEmailResult | null> => {
    const { data } = await verifyMutation({ variables: { token } });
    const result = data?.verifyEmail;
    if (result?.success && result.user && result.accessToken) {
      return { user: result.user, accessToken: result.accessToken };
    }
    return null;
  };

  return { verify, loading, error: error?.message };
}
