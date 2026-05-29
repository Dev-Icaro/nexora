import { schedule } from 'node-cron';

import settings from '@/config/settings';
import { Follow } from '@/models/follow.model';
import { Post } from '@/models/post.model';
import { User } from '@/models/user.model';
import logger from '@/utils/logger';

export async function reconcileFollowCounters(): Promise<void> {
  const [followersResults, followingResults, postResults, users] = await Promise.all([
    Follow.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$followingId', count: { $sum: 1 } } }]),
    Follow.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$followerId', count: { $sum: 1 } } }]),
    Post.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$user', count: { $sum: 1 } } }]),
    User.find({}, { _id: 1, followersCount: 1, followingCount: 1, postCount: 1 }).lean(),
  ]);

  const followersMap = new Map(followersResults.map(r => [r._id.toString(), r.count]));
  const followingMap = new Map(followingResults.map(r => [r._id.toString(), r.count]));
  const postMap = new Map(postResults.map(r => [r._id.toString(), r.count]));

  let correctedFields = 0;

  for (const user of users) {
    const userId = user._id.toString();
    const checks = [
      { field: 'followersCount', stored: user.followersCount ?? 0, actual: followersMap.get(userId) ?? 0 },
      { field: 'followingCount', stored: user.followingCount ?? 0, actual: followingMap.get(userId) ?? 0 },
      { field: 'postCount', stored: user.postCount ?? 0, actual: postMap.get(userId) ?? 0 },
    ];

    const patch: Record<string, number> = {};
    for (const { field, stored, actual } of checks) {
      if (stored !== actual) {
        patch[field] = actual;
        logger.warn('Follow counter drift detected', { userId, field, stored, actual });
        correctedFields++;
      }
    }

    if (Object.keys(patch).length > 0) {
      await User.updateOne({ _id: user._id }, { $set: patch });
    }
  }

  logger.info(`Reconcile follow counters: checked ${users.length} users, corrected ${correctedFields} field(s)`);
}

export function startReconcileFollowCountersJob(): void {
  schedule(settings.RECONCILE_FOLLOW_COUNTERS_CRON, async () => {
    try {
      await reconcileFollowCounters();
    } catch (error) {
      logger.error('Reconcile follow counters job failed', error);
    }
  });
}
