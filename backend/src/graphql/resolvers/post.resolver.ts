import { postQueries } from '@/graphql/queries/post.query';

export const postResolver = {
  Query: {
    ...postQueries,
  },
  Post: {
    likeCount: (parent: { likes: unknown[] }) => parent.likes.length,
    commentCount: (parent: { comments: unknown[] }) => parent.comments.length,
  },
};
