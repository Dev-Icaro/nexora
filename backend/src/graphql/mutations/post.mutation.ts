import { pubsub, TOPICS } from '@/graphql/pubsub';
import logger from '@/utils/logger';

import type { GraphQLContext } from '../context';

export const postMutations = {
  getUploadUrl: async (
    _: unknown,
    { request }: { request: { filename: string; contentType: string } },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.postService.getUploadUrl(currentUser!.userId, request.filename, request.contentType),

  createPost: async (
    _: unknown,
    { body, objectKey }: { body: string; objectKey?: string },
    { dataSources, currentUser }: GraphQLContext,
  ) => {
    const result = await dataSources.postService.createPost(currentUser!.userId, body, objectKey);
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
