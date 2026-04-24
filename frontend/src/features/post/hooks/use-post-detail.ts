import { useQuery } from '@apollo/client/react';

import type { GetPostByIdResponse, GetPostByIdVariables } from '../api/post.queries';
import { GET_POST_BY_ID } from '../api/post.queries';

export function usePostDetail(postId: string | null) {
  const { data, loading, error } = useQuery<GetPostByIdResponse, GetPostByIdVariables>(GET_POST_BY_ID, {
    variables: { postId: postId! },
    skip: !postId,
  });

  return {
    post: data?.getPost ?? null,
    loading: loading || (!!postId && !data && !error),
    error: error?.message,
  };
}
