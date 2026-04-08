import { Post } from '@/models/post.model';

export const postQueries = {
  getPosts: async () => {
    return await Post.find();
  },

  getPost: async (_: unknown, { postId }: { postId: string }) => {
    return await Post.findById(postId);
  },
};
