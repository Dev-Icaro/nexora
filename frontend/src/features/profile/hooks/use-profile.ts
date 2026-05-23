import { useMutation, useQuery } from '@apollo/client/react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import type { UpdateProfileRequest } from '@/gql/graphql';
import { toast } from '@/shared/lib/toast';

import { UPDATE_PROFILE_MUTATION } from '../api/profile.mutations';
import type { ProfileUser, StorageInfo } from '../api/profile.queries';
import { GET_PROFILE } from '../api/profile.queries';

export type UseProfileResult = {
  user: ProfileUser | null;
  storageInfo: StorageInfo | null;
  loading: boolean;
  error: string | undefined;
  updateProfile: (input: UpdateProfileRequest) => Promise<boolean>;
  updateLoading: boolean;
};

export function useProfile(userId: string): UseProfileResult {
  const { updateUser } = useAuth();
  const { data, loading, error } = useQuery(GET_PROFILE, {
    variables: { userId },
  });

  const [updateProfileMutation, { loading: updateLoading }] = useMutation(UPDATE_PROFILE_MUTATION);

  const updateProfile = async (input: UpdateProfileRequest): Promise<boolean> => {
    try {
      const result = await updateProfileMutation({ variables: { updateProfileRequest: input } });
      const response = result.data?.updateProfile;

      if (!response?.success) {
        toast.error(response?.message ?? 'Failed to update profile');
        return false;
      }

      if (response.user?.avatarUrl) {
        updateUser({ avatarUrl: response.user.avatarUrl });
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
    storageInfo: data?.getUserById?.storageInfo ?? null,
    loading,
    error: error?.message,
    updateProfile,
    updateLoading,
  };
}
