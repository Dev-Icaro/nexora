import type { GraphQLContext } from '@/graphql/context';
import { postQueries } from '@/graphql/queries/post.query';

export const postResolver = {
  Query: {
    ...postQueries,
  },
  Post: {
    author: (
      parent: { authorId?: string; user?: { toString(): string } | string },
      _: unknown,
      { loaders }: GraphQLContext,
    ) => loaders.usersLoader.load(parent.authorId ?? String(parent.user)),
    comments: (parent: { id: string }, _: unknown, { loaders }: GraphQLContext) =>
      loaders.commentsLoader.load(parent.id),
    likes: (parent: { id: string }, _: unknown, { loaders }: GraphQLContext) => loaders.likesLoader.load(parent.id),
    likeCount: (parent: { likeCount: number }) => parent.likeCount,
    commentCount: (parent: { commentCount: number }) => parent.commentCount,
  },
  Comment: {
    author: (
      parent: { authorId?: string; userId?: { toString(): string } | string },
      _: unknown,
      { loaders }: GraphQLContext,
    ) => loaders.usersLoader.load(parent.authorId ?? String(parent.userId)),
  },
  Like: {
    author: (
      parent: { authorId?: string; userId?: { toString(): string } | string },
      _: unknown,
      { loaders }: GraphQLContext,
    ) => loaders.usersLoader.load(parent.authorId ?? String(parent.userId)),
  },
};
