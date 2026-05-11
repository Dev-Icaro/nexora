import { schedule } from 'node-cron';

import settings from '@/config/settings';
import { MediaUpload } from '@/models/media-upload.model';
import logger from '@/utils/logger';

/** Deletes media_uploads records that were never confirmed within 1 hour.
 *  S3 object cleanup is handled by an S3 lifecycle policy, not this job.
 */
export function startCleanupPendingUploadsJob(): void {
  schedule('*/30 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - settings.PENDING_UPLOADS_CLEANUP_CUTOFF_MS);
      const result = await MediaUpload.deleteMany({ status: 'pending', createdAt: { $lt: cutoff } });
      if (result.deletedCount > 0) {
        logger.info(`Cleanup job: deleted ${result.deletedCount} stale pending upload(s)`);
      }
    } catch (error) {
      logger.error('Cleanup job failed', error);
    }
  });
}
