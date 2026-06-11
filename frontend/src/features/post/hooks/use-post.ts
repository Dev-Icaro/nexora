import { type ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

import { CREATE_COMMENT, LIKE_COMMENT, LIKE_POST, UNLIKE_COMMENT } from '../api/post.mutations';
import { GET_POST_BY_ID } from '../api/post.queries';

function writeCommentLikeCount(cache: ApolloCache, commentId: string, likeCount: number) {
  cache.modify({
    id: cache.identify({ __typename: 'Comment', id: commentId }),
    fields: { likeCount: () => likeCount },
  });
}

export function usePost(postId: string | null) {
  const { data, loading, error } = useQuery(GET_POST_BY_ID, {
    variables: { postId: postId! },
    skip: !postId,
  });

  const [likePostMutation] = useMutation(LIKE_POST);
  const [createCommentMutation] = useMutation(CREATE_COMMENT);
  const [likeCommentMutation] = useMutation(LIKE_COMMENT);
  const [unlikeCommentMutation] = useMutation(UNLIKE_COMMENT);

  const post = data?.getPost ?? null;

  const likePost = (wasLiked: boolean) =>
    likePostMutation({
      variables: { postId: postId! },
      optimisticResponse: {
        likePost: {
          __typename: 'LikePostResponse',
          code: 200,
          message: '',
          success: true,
          post: {
            __typename: 'Post',
            id: postId!,
            isLiked: !wasLiked,
            likeCount: Math.max(0, (post?.likeCount ?? 0) + (wasLiked ? -1 : 1)),
          },
        },
      },
    });

  const createComment = (body: string) =>
    createCommentMutation({
      variables: { postId: postId!, body },
      update(cache, { data: mutationData }) {
        const newComment = mutationData?.createComment.comment;
        if (!newComment) return;
        const commentRef = cache.identify({ __typename: 'Comment', id: newComment.id });
        if (!commentRef) return;
        cache.modify({
          id: cache.identify({ __typename: 'Post', id: postId }),
          fields: {
            comments: (existing: readonly { __ref: string }[]) => [...existing, { __ref: commentRef }],
            commentCount: (n: number) => n + 1,
          },
        });
      },
    });

  const likeComment = (commentId: string) =>
    likeCommentMutation({
      variables: { commentId },
      update(cache, { data }) {
        const comment = data?.likeComment?.comment;
        if (comment) writeCommentLikeCount(cache, commentId, comment.likeCount);
      },
    });

  const unlikeComment = (commentId: string) =>
    unlikeCommentMutation({
      variables: { commentId },
      update(cache, { data }) {
        const comment = data?.unlikeComment?.comment;
        if (comment) writeCommentLikeCount(cache, commentId, comment.likeCount);
      },
    });

  return {
    post,
    loading: loading || (!!postId && !data && !error),
    error: error?.message,
    likePost,
    createComment,
    likeComment,
    unlikeComment,
  };
}
