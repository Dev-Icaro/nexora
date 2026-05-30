import { useMutation } from '@apollo/client/react';
import { useState } from 'react';

import type { RegisterRequest } from '@/gql/graphql';

import { REGISTER_MUTATION } from '../api/auth.mutations';

type UseRegisterResult = {
  register: (input: RegisterRequest) => Promise<void>;
  loading: boolean;
  error: string | undefined;
  submittedEmail: string | null;
};

export function useRegister(): UseRegisterResult {
  const [registerMutation, { loading, error }] = useMutation(REGISTER_MUTATION);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const register = async (input: RegisterRequest) => {
    const { data } = await registerMutation({ variables: { registerRequest: input } });
    if (data?.register) {
      setSubmittedEmail(input.email);
    }
  };

  return { register, loading, error: error?.message, submittedEmail };
}
