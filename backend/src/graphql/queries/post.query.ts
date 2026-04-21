import type { GraphQLContext } from '@/graphql/context';
import { Post } from '@/models/post.model';

export const postQueries = {
  getPosts: async () => {
    return await Post.find();
  },

  getPost: async (_: unknown, { postId }: { postId: string }) => {
    return await Post.findById(postId);
  },

  feed: async (
    _: unknown,
    { first = 10, after }: { first?: number; after?: string },
    { dataSources }: GraphQLContext,
  ) => dataSources.postService.getFeed(first, after),
};
