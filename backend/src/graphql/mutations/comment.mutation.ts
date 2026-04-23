import type { GraphQLContext } from '../context';

export const commentMutations = {
  createComment: async (
    _: unknown,
    { postId, body }: { postId: string; body: string },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.commentService.createComment(currentUser!.userId, postId, body),

  deleteComment: async (
    _: unknown,
    { postId, commentId }: { postId: string; commentId: string },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.commentService.deleteComment(currentUser!.userId, postId, commentId),
};
