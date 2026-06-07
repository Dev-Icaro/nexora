import type { Reference } from '@apollo/client';
import type { ModifierDetails } from '@apollo/client/cache';
import { useMutation } from '@apollo/client/react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from '@/shared/lib/toast';

import { FOLLOW_USER, REMOVE_FOLLOWER, UNFOLLOW_USER } from '../api/follow.mutations';

type UseFollowResult = {
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  removeFollower: (userId: string) => Promise<void>;
  followLoading: boolean;
  unfollowLoading: boolean;
};

export function useFollow(): UseFollowResult {
  const { state } = useAuth();
  const viewerId = state.user?.id;
  const [followMutation, { loading: followLoading }] = useMutation(FOLLOW_USER);
  const [unfollowMutation, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER);
  const [removeFollowerMutation] = useMutation(REMOVE_FOLLOWER);

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
          const id = cache.identify({ __typename: 'User', id: userId });
          const serverUser = data?.followUser.user;
          cache.modify({
            id,
            fields: {
              isFollowing: () => serverUser?.isFollowing ?? true,
              followersCount: (existing: number) => serverUser?.followersCount ?? existing + 1,
            },
          });
          if (viewerId) {
            cache.modify({
              id: cache.identify({ __typename: 'User', id: viewerId }),
              fields: {
                followingCount: (existing: number) => existing + 1,
              },
            });
          }
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
          const id = cache.identify({ __typename: 'User', id: userId });
          const serverUser = data?.unfollowUser.user;
          cache.modify({
            id,
            fields: {
              isFollowing: () => serverUser?.isFollowing ?? false,
              followersCount: (existing: number) => serverUser?.followersCount ?? Math.max(0, existing - 1),
            },
          });
          if (viewerId) {
            cache.modify({
              id: cache.identify({ __typename: 'User', id: viewerId }),
              fields: {
                followingCount: (existing: number) => Math.max(0, existing - 1),
              },
            });
          }
        },
      });

      if (!result.data?.unfollowUser.success) {
        toast.error(result.data?.unfollowUser.message ?? 'Failed to unfollow user');
      }
    } catch {
      toast.error('Failed to unfollow user');
    }
  };

  const removeFollower = async (userId: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateGetUserFollowers = (existing: any, { readField }: ModifierDetails) => {
      if (!existing?.edges) return existing;
      return {
        ...existing,
        edges: existing.edges.filter(
          (edge: Reference) => readField('id', readField('node', edge) as Reference) !== userId,
        ),
      };
    };

    try {
      const result = await removeFollowerMutation({
        variables: { userId },
        optimisticResponse: {
          removeFollower: {
            code: 200,
            success: true,
            message: 'Follower removed successfully',
            user: null,
          },
        },
        update(cache, { data }) {
          cache.modify({
            fields: { getUserFollowers: updateGetUserFollowers },
          });
          if (viewerId) {
            const serverUser = data?.removeFollower.user;
            cache.modify({
              id: cache.identify({ __typename: 'User', id: viewerId }),
              fields: {
                followersCount: (existing: number) => serverUser?.followersCount ?? Math.max(0, existing - 1),
              },
            });
          }
        },
      });

      if (!result.data?.removeFollower.success) {
        toast.error(result.data?.removeFollower.message ?? 'Failed to remove follower');
      }
    } catch {
      toast.error('Failed to remove follower');
    }
  };

  return { follow, unfollow, removeFollower, followLoading, unfollowLoading };
}
