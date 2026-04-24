import { useQuery } from '@apollo/client/react';

import { GET_PROFILE } from '../api/profile.queries';
import type { GetProfileRequest, GetProfileResponse, ProfileUser } from '../api/profile.types';

export type UseProfileResult = {
  user: ProfileUser | null;
  loading: boolean;
  error: string | undefined;
};

export function useProfile(userId: string): UseProfileResult {
  const { data, loading, error } = useQuery<GetProfileResponse, GetProfileRequest>(GET_PROFILE, {
    variables: { userId },
  });

  return {
    user: data?.getUserById ?? null,
    loading,
    error: error?.message,
  };
}
