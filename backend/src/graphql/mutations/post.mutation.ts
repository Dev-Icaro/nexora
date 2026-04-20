import type { GraphQLContext } from '../context';

export const postMutations = {
  createPost: async (
    _: unknown,
    { body, mediaUrl }: { body: string; mediaUrl?: string },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.postService.createPost(currentUser!.userId, body, mediaUrl),

  deletePost: async (_: unknown, { postId }: { postId: string }, { dataSources, currentUser }: GraphQLContext) =>
    dataSources.postService.deletePost(currentUser!.userId, postId),

  likePost: async (_: unknown, { postId }: { postId: string }, { dataSources, currentUser }: GraphQLContext) =>
    dataSources.postService.likePost(currentUser!.userId, postId),
};
