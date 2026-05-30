import { useMutation } from '@apollo/client/react';

import { GET_PROFILE } from '@/features/profile/api/profile.queries';
import { toast } from '@/shared/lib/toast';

import { FOLLOW_USER, UNFOLLOW_USER } from '../api/follow.mutations';

type UseFollowResult = {
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  followLoading: boolean;
  unfollowLoading: boolean;
};

export function useFollow(): UseFollowResult {
  const [followMutation, { loading: followLoading }] = useMutation(FOLLOW_USER);
  const [unfollowMutation, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER);

  const follow = async (userId: string): Promise<void> => {
    try {
      const result = await followMutation({
        variables: { userId },
        optimisticResponse: {
          followUser: {
            code: 200,
            success: true,
            message: 'User followed successfully',
            user: null,
          },
        },
        update(cache, { data }) {
          const cached = cache.readQuery({ query: GET_PROFILE, variables: { userId } });
          if (!cached?.getUserById) return;

          const serverUser = data?.followUser.user;
          cache.writeQuery({
            query: GET_PROFILE,
            variables: { userId },
            data: {
              getUserById: {
                ...cached.getUserById,
                isFollowing: serverUser?.isFollowing ?? true,
                followersCount: serverUser?.followersCount ?? cached.getUserById.followersCount + 1,
              },
            },
          });
        },
      });

      if (!result.data?.followUser.success) {
        toast.error(result.data?.followUser.message ?? 'Failed to follow user');
      }
    } catch {
      toast.error('Failed to follow user');
    }
  };

  const unfollow = async (userId: string): Promise<void> => {
    try {
      const result = await unfollowMutation({
        variables: { userId },
        optimisticResponse: {
          unfollowUser: {
            code: 200,
            success: true,
            message: 'User unfollowed successfully',
            user: null,
          },
        },
        update(cache, { data }) {
          const cached = cache.readQuery({ query: GET_PROFILE, variables: { userId } });
          if (!cached?.getUserById) return;

          const serverUser = data?.unfollowUser.user;
          cache.writeQuery({
            query: GET_PROFILE,
            variables: { userId },
            data: {
              getUserById: {
                ...cached.getUserById,
                isFollowing: serverUser?.isFollowing ?? false,
                followersCount: serverUser?.followersCount ?? Math.max(0, cached.getUserById.followersCount - 1),
              },
            },
          });
        },
      });

      if (!result.data?.unfollowUser.success) {
        toast.error(result.data?.unfollowUser.message ?? 'Failed to unfollow user');
      }
    } catch {
      toast.error('Failed to unfollow user');
    }
  };

  return { follow, unfollow, followLoading, unfollowLoading };
}
