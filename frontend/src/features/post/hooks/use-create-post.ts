import { useMutation } from '@apollo/client/react';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/shared/lib/utils';

import { CREATE_POST } from '../api/post.mutations';
import type { CreatePostRequest, CreatePostResponse } from '../api/post.types';

type UseCreatePostResult = {
  createPost: (body: string, mediaUrl?: string) => Promise<void>;
  loading: boolean;
  error: string | undefined;
};

export function useCreatePost(): UseCreatePostResult {
  const [createPostMutation, { loading, error, data }] = useMutation<CreatePostResponse, CreatePostRequest>(
    CREATE_POST,
  );

  const errorMessage = useMemo(() => getApiErrorMessage(error, data), [data, error]);

  const createPost = async (body: string, mediaUrl?: string) => {
    await createPostMutation({ variables: { body, mediaUrl } });
  };

  return { createPost, loading, error: errorMessage };
}
