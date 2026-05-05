import { pubsub, TOPICS } from '@/graphql/pubsub';
import logger from '@/utils/logger';

import type { GraphQLContext } from '../context';

export const postMutations = {
  createPost: async (
    _: unknown,
    { body, mediaUrl }: { body: string; mediaUrl?: string },
    { dataSources, currentUser }: GraphQLContext,
  ) => {
    const result = await dataSources.postService.createPost(currentUser!.userId, body, mediaUrl);
    if (result.success && result.post) {
      pubsub
        .publish(TOPICS.NEW_POST, { newPost: result.post })
        .catch(err => logger.error('Failed to publish newPost event', err));
    }
    return result;
  },

  deletePost: async (_: unknown, { postId }: { postId: string }, { dataSources, currentUser }: GraphQLContext) =>
    dataSources.postService.deletePost(currentUser!.userId, postId),

  likePost: async (_: unknown, { postId }: { postId: string }, { dataSources, currentUser }: GraphQLContext) =>
    dataSources.postService.likePost(currentUser!.userId, postId),
};
