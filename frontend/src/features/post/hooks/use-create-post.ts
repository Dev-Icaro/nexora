import { useMutation } from '@apollo/client/react';

import { toast } from '@/shared/utils/toast';

import { CREATE_POST } from '../api/post.mutations';
import type { CreatePostRequest, CreatePostResponse, PostNode } from '../api/post.types';

type UseCreatePostResult = {
  createPost: (body: string, mediaUrl?: string) => Promise<PostNode | undefined>;
  loading: boolean;
};

export function useCreatePost(): UseCreatePostResult {
  const [createPostMutation, { loading }] = useMutation<CreatePostResponse, CreatePostRequest>(CREATE_POST);

  const createPost = async (body: string, mediaUrl?: string): Promise<PostNode | undefined> => {
    try {
      const result = await createPostMutation({ variables: { body, mediaUrl } });
      const responseData = result.data;
      if (!responseData?.createPost.success) {
        toast.error(responseData?.createPost.message ?? 'Failed to create post');
        return undefined;
      }
      return responseData.createPost.post;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post');
      return undefined;
    }
  };

  return { createPost, loading };
}
