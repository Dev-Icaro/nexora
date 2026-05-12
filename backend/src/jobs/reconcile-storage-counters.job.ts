import { schedule } from 'node-cron';

import { MediaUpload } from '@/models/media-upload.model';
import { User } from '@/models/user.model';
import logger from '@/utils/logger';

export async function reconcileStorageCounters(): Promise<void> {
  const results = await MediaUpload.aggregate<{ _id: string; actualBytes: number }>([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$userId', actualBytes: { $sum: '$sizeBytes' } } },
  ]);

  for (const { _id: userId, actualBytes } of results) {
    await User.updateOne({ _id: userId }, { $set: { storageUsedBytes: actualBytes } });
  }

  logger.info(`Reconciled storage for ${results.length} users`);
}

export function startReconcileStorageCountersJob(): void {
  schedule('0 2 * * *', async () => {
    try {
      await reconcileStorageCounters();
    } catch (error) {
      logger.error('Reconcile storage counters job failed', error);
    }
  });
}
