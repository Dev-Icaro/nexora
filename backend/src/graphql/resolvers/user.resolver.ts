import settings from '@/config/settings';
import { userQueries } from '@/graphql/queries/user.query';
import { signMediaUrl } from '@/services/cloud/cloud-front';

export const userResolver = {
  Query: {
    ...userQueries,
  },
  User: {
    storageInfo: (parent: { storageUsedBytes?: number; storageQuotaBytes?: number }) => {
      const used = parent.storageUsedBytes ?? 0;
      const quota = parent.storageQuotaBytes ?? settings.STORAGE_QUOTA_FREE_BYTES;
      return {
        usedBytes: used,
        quotaBytes: quota,
        remainingBytes: Math.max(0, quota - used),
        usedPercent: quota > 0 ? (used / quota) * 100 : 0,
      };
    },
    avatarUrl: async (parent: { avatarKey?: string }): Promise<string | null> => {
      if (parent.avatarKey) return signMediaUrl(parent.avatarKey);
      return null;
    },
  },
};
