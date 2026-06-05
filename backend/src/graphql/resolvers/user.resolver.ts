import settings from '@/config/settings';
import type { Resolvers } from '@/graphql/__generated__/types';
import { signMediaUrl } from '@/services/cloud/cloud-front';

export const userResolver: Resolvers = {
  Query: {
    getUserById: (_, { userId }, { dataSources }) => dataSources.userService.getById(userId),
    getUserFollowers: (_, { userId, first, after }, { dataSources }) =>
      dataSources.followService.getFollowers(userId, { first: first ?? 10, after: after ?? undefined }),
    getUserFollowings: (_, { userId, first, after }, { dataSources }) =>
      dataSources.followService.getFollowings(userId, { first: first ?? 10, after: after ?? undefined }),
  },
  Mutation: {
    updateProfile: async (_, { updateProfileRequest }, { dataSources, currentUser }) => {
      const user = await dataSources.userService.updateProfile({
        userId: currentUser!.userId,
        bio: updateProfileRequest.bio ?? undefined,
        position: updateProfileRequest.position ?? undefined,
        objectKey: updateProfileRequest.objectKey ?? undefined,
      });
      return { code: 200, success: true, message: 'Profile updated successfully', user };
    },

    updateThemePreference: async (_, { theme }, { dataSources, currentUser }) => {
      const user = await dataSources.userService.updateThemePreference({
        userId: currentUser!.userId,
        theme,
      });
      return { code: 200, success: true, message: 'Theme preference updated', user };
    },

    getAvatarUploadUrl: async (_, { request }, { dataSources, currentUser }) => {
      const { uploadUrl, fields, objectKey } = await dataSources.userService.getAvatarUploadUrl({
        userId: currentUser!.userId,
        ...request,
      });
      return { code: 200, success: true, message: 'Upload URL generated', uploadUrl, fields, objectKey };
    },

    followUser: async (_, { userId }, { dataSources, currentUser }) => {
      await dataSources.followService.follow(currentUser!.userId, userId);
      const user = await dataSources.userService.getById(userId);
      return { code: 200, success: true, message: 'User followed successfully', user };
    },

    unfollowUser: async (_, { userId }, { dataSources, currentUser }) => {
      await dataSources.followService.unfollow(currentUser!.userId, userId);
      const user = await dataSources.userService.getById(userId);
      return { code: 200, success: true, message: 'User unfollowed successfully', user };
    },
  },
  User: {
    storageInfo: parent => {
      const used = parent.storageUsedBytes ?? 0;
      const quota = settings.STORAGE_QUOTA_FREE_BYTES;
      return {
        usedBytes: used,
        quotaBytes: quota,
        remainingBytes: Math.max(0, quota - used),
        usedPercent: quota > 0 ? (used / quota) * 100 : 0,
      };
    },
    avatarUrl: async parent => {
      if (parent.avatarKey) return signMediaUrl(parent.avatarKey);
      return null;
    },
    followersCount: parent => parent.followersCount ?? 0,
    followingCount: parent => parent.followingCount ?? 0,
    postCount: parent => parent.postCount ?? 0,
    isFollowing: (parent, _, { loaders }) => loaders.isFollowingLoader.load(parent.id),
  },
};
