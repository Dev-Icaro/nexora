import { AppException } from '@/exceptions';

export const postMutations = {
  createPost: async () => {
    throw new AppException('Not implemented');
  },

  deletePost: async () => {
    throw new Error('Not implemented');
  },

  likePost: async () => {
    throw new Error('Not implemented');
  },
};
