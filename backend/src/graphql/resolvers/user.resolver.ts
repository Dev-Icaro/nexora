import settings from '@/config/settings';
import type { Resolvers } from '@/graphql/__generated__/types';
import { signMediaUrl } from '@/services/cloud/cloud-front';

export const userResolver: Resolvers = {
  Query: {
    getUserById: (_, { userId }, { dataSources }) => dataSources.userService.getById(userId),
  },
  Mutation: {
    updateProfile: (_, { updateProfileRequest }, { dataSources, currentUser }) =>
      dataSources.userService.updateProfile(currentUser!.userId, {
        bio: updateProfileRequest.bio ?? undefined,
        position: updateProfileRequest.position ?? undefined,
        objectKey: updateProfileRequest.objectKey ?? undefined,
      }),

    updateThemePreference: (_, { theme }, { dataSources, currentUser }) =>
      dataSources.userService.updateThemePreference(currentUser!.userId, { theme }),

    getAvatarUploadUrl: (_, { request }, { dataSources, currentUser }) =>
      dataSources.userService.getAvatarUploadUrl(
        currentUser!.userId,
        request.filename,
        request.contentType,
        request.fileSizeBytes,
      ),
  },
  User: {
    storageInfo: parent => {
      const used = parent.storageUsedBytes ?? 0;
      const quota = parent.storageQuotaBytes ?? settings.STORAGE_QUOTA_FREE_BYTES;
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
  },
};
