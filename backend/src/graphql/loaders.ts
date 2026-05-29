import DataLoader from 'dataloader';

import settings from '@/config/settings';
import type { CommentDto } from '@/dtos/comment/comment.dto';
import type { LikeDto } from '@/dtos/post/like.dto';
import type { UserDto } from '@/dtos/user/user.dto';
import { Comment } from '@/models/comment.model';
import { Like } from '@/models/like.model';
import { User } from '@/models/user.model';

export function createLoaders() {
  return {
    commentsLoader: new DataLoader(async (postIds: readonly string[]) => {
      const comments = await Comment.find({ postId: { $in: postIds } }).sort({ _id: 1 });
      const map = new Map<string, CommentDto[]>(postIds.map(id => [id, []]));
      for (const c of comments) {
        map.get(String(c.postId))?.push({
          id: c._id.toString(),
          postId: c.postId.toString(),
          body: c.body,
          authorId: c.userId.toString(),
          createdAt: c.createdAt,
        });
      }
      return postIds.map(id => map.get(id) ?? []);
    }),

    likesLoader: new DataLoader(async (postIds: readonly string[]) => {
      const likes = await Like.find({ postId: { $in: postIds } }).sort({ _id: 1 });
      const map = new Map<string, LikeDto[]>(postIds.map(id => [id, []]));
      for (const l of likes) {
        map.get(String(l.postId))?.push({
          id: l._id.toString(),
          postId: l.postId.toString(),
          authorId: l.userId.toString(),
          createdAt: l.createdAt,
        });
      }
      return postIds.map(id => map.get(id) ?? []);
    }),

    usersLoader: new DataLoader(async (userIds: readonly string[]) => {
      const users = await User.find({ _id: { $in: userIds } });
      const map = new Map<string, UserDto>(
        users.map(u => [
          String(u._id),
          {
            id: u._id.toString(),
            email: u.email,
            username: u.username,
            bio: u.bio,
            position: u.position,
            themePreference: u.themePreference,
            avatarKey: u.avatarKey,
            createdAt: u.createdAt,
            storageUsedBytes: u.storageUsedBytes ?? 0,
            storageQuotaBytes: settings.STORAGE_QUOTA_FREE_BYTES,
          },
        ]),
      );
      return userIds.map(id => map.get(id) ?? null);
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
