import type { GraphQLContext } from '@/graphql/context';
import { Post } from '@/models/post.model';

export const postQueries = {
  getPosts: async () => {
    return await Post.find();
  },

  getPost: async (_: unknown, { postId }: { postId: string }, { dataSources }: GraphQLContext) => {
    return await dataSources.postService.getPostById(postId);
  },

  feed: async (
    _: unknown,
    { first = 10, after }: { first?: number; after?: string },
    { dataSources }: GraphQLContext,
  ) => dataSources.postService.getFeed(first, after),

  getUserPosts: async (
    _: unknown,
    { userId, first = 10, after }: { userId: string; first?: number; after?: string },
    { dataSources }: GraphQLContext,
  ) => dataSources.postService.getUserPosts(userId, first, after),
};
