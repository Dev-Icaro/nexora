import type { GraphQLContext } from '@/graphql/context';
import { postQueries } from '@/graphql/queries/post.query';

export const postResolver = {
  Query: {
    ...postQueries,
  },
  Post: {
    comments: (parent: { id: string }, _: unknown, { loaders }: GraphQLContext) =>
      loaders.commentsLoader.load(parent.id),
    likes: (parent: { id: string }, _: unknown, { loaders }: GraphQLContext) => loaders.likesLoader.load(parent.id),
    likeCount: (parent: { likeCount: number }) => parent.likeCount,
    commentCount: (parent: { commentCount: number }) => parent.commentCount,
  },
};
