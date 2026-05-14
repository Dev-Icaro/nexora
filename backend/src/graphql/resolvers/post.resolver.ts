import type { GraphQLContext } from '@/graphql/context';
import { postQueries } from '@/graphql/queries/post.query';
import { signMediaUrl } from '@/services/cloud/cloud-front';

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
    mediaUrl: async (parent: { mediaKey?: string; mediaUrl?: string }): Promise<string | null> => {
      if (parent.mediaKey) {
        return signMediaUrl(parent.mediaKey);
      }
      return parent.mediaUrl ?? null;
    },
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
