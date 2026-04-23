import DataLoader from 'dataloader';

import { Comment } from '@/models/comment.model';
import { Like } from '@/models/like.model';

export function createLoaders() {
  return {
    commentsLoader: new DataLoader(async (postIds: readonly string[]) => {
      const comments = await Comment.find({ postId: { $in: postIds } }).sort({ _id: 1 });
      const map = new Map<string, typeof comments>(postIds.map(id => [id, []]));
      for (const comment of comments) map.get(String(comment.postId))?.push(comment);
      return postIds.map(id => map.get(id) ?? []);
    }),

    likesLoader: new DataLoader(async (postIds: readonly string[]) => {
      const likes = await Like.find({ postId: { $in: postIds } }).sort({ _id: 1 });
      const map = new Map<string, typeof likes>(postIds.map(id => [id, []]));
      for (const like of likes) map.get(String(like.postId))?.push(like);
      return postIds.map(id => map.get(id) ?? []);
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
