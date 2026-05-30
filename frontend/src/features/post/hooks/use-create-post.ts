import { useMutation } from '@apollo/client/react';

import { toast } from '@/shared/lib/toast';

import { CREATE_POST } from '../api/post.mutations';
import type { PostNode } from '../api/post.queries';

type UseCreatePostResult = {
  createPost: (body: string, objectKey?: string) => Promise<PostNode | undefined>;
  loading: boolean;
};

export function useCreatePost(): UseCreatePostResult {
  const [createPostMutation, { loading }] = useMutation(CREATE_POST);

  const createPost = async (body: string, objectKey?: string): Promise<PostNode | undefined> => {
    try {
      const result = await createPostMutation({
        variables: { body, objectKey },
        refetchQueries: objectKey ? ['GetProfile'] : [],
      });

      const responseData = result.data;
      if (!responseData?.createPost.success || !responseData.createPost.post) {
        toast.error(responseData?.createPost.message ?? 'Failed to create post');
        return undefined;
      }

      return {
        ...responseData.createPost.post,
        author: { ...responseData.createPost.post.author, isFollowing: null },
        likes: [],
      };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post');
      return undefined;
    }
  };

  return { createPost, loading };
}
