import { type ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

import { useAuth } from '@/features/auth/hooks/use-auth';

import { CREATE_COMMENT, LIKE_COMMENT, LIKE_POST, UNLIKE_COMMENT } from '../api/post.mutations';
import { GET_POST_BY_ID } from '../api/post.queries';

function writeCommentLikeFields(cache: ApolloCache, commentId: string, likeCount: number, isLiked: boolean) {
  cache.modify({
    id: cache.identify({ __typename: 'Comment', id: commentId }),
    fields: { likeCount: () => likeCount, isLiked: () => isLiked },
  });
}

export function usePost(postId: string | null) {
  const {
    state: { user },
  } = useAuth();
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
      optimisticResponse: {
        createComment: {
          __typename: 'CreateCommentResponse',
          code: 200,
          message: '',
          success: true,
          comment: {
            __typename: 'Comment',
            id: `optimistic-${Date.now()}`,
            body,
            createdAt: new Date().toISOString(),
            likeCount: 0,
            isLiked: false,
            author: {
              __typename: 'User',
              id: user?.id ?? '',
              username: user?.username ?? '',
              avatarUrl: user?.avatarUrl ?? null,
            },
          },
        },
      },
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

  const likeComment = (commentId: string, currentLikeCount: number) =>
    likeCommentMutation({
      variables: { commentId },
      optimisticResponse: {
        likeComment: {
          __typename: 'LikeCommentResponse',
          code: 200,
          message: '',
          success: true,
          comment: { __typename: 'Comment', id: commentId, likeCount: currentLikeCount + 1, isLiked: true },
        },
      },
      update(cache, { data }) {
        const comment = data?.likeComment?.comment;
        if (comment) writeCommentLikeFields(cache, commentId, comment.likeCount, true);
      },
    });

  const unlikeComment = (commentId: string, currentLikeCount: number) =>
    unlikeCommentMutation({
      variables: { commentId },
      optimisticResponse: {
        unlikeComment: {
          __typename: 'LikeCommentResponse',
          code: 200,
          message: '',
          success: true,
          comment: {
            __typename: 'Comment',
            id: commentId,
            likeCount: Math.max(0, currentLikeCount - 1),
            isLiked: false,
          },
        },
      },
      update(cache, { data }) {
        const comment = data?.unlikeComment?.comment;
        if (comment) writeCommentLikeFields(cache, commentId, comment.likeCount, false);
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
