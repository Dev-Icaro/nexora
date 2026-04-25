import { useMutation, useQuery } from '@apollo/client/react';

import { toast } from '@/shared/lib/toast';

import { UPDATE_PROFILE_MUTATION } from '../api/profile.mutations';
import { GET_PROFILE } from '../api/profile.queries';
import type {
  GetProfileRequest,
  GetProfileResponse,
  ProfileUser,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../api/profile.types';

export type UseProfileResult = {
  user: ProfileUser | null;
  loading: boolean;
  error: string | undefined;
  updateProfile: (input: UpdateProfileRequest) => Promise<boolean>;
  updateLoading: boolean;
};

export function useProfile(userId: string): UseProfileResult {
  const { data, loading, error } = useQuery<GetProfileResponse, GetProfileRequest>(GET_PROFILE, {
    variables: { userId },
  });

  const [updateProfileMutation, { loading: updateLoading }] = useMutation<
    UpdateProfileResponse,
    { updateProfileRequest: UpdateProfileRequest }
  >(UPDATE_PROFILE_MUTATION);

  const updateProfile = async (input: UpdateProfileRequest): Promise<boolean> => {
    try {
      const result = await updateProfileMutation({ variables: { updateProfileRequest: input } });
      const response = result.data?.updateProfile;

      if (!response?.success) {
        toast.error(response?.message ?? 'Failed to update profile');
        return false;
      }

      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  return {
    user: data?.getUserById ?? null,
    loading,
    error: error?.message,
    updateProfile,
    updateLoading,
  };
}
