import { useState } from 'react';

import { toast } from '@/shared/lib/toast';

import { useBookmark } from './use-bookmark';
import { usePost } from './use-post';

export function usePostDetail(postId: string | null) {
  const { post, loading, error, likePost, createComment, likeComment, unlikeComment } = usePost(postId);
  const { bookmarked, toggleBookmark } = useBookmark(postId ?? '', post?.isBookmarked);

  const [sending, setSending] = useState(false);

  const liked = post?.isLiked ?? false;
  const likeCount = post?.likeCount ?? 0;
  const comments = (post?.comments ?? []).filter((c): c is NonNullable<typeof c> => c !== null);

  const onLikePost = async () => {
    if (!postId) return;
    try {
      await likePost(liked);
    } catch {
      toast.error('Failed to update like');
    }
  };

  const onLikeComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    const isCurrentlyLiked = comment.isLiked ?? false;
    try {
      if (isCurrentlyLiked) {
        await unlikeComment(commentId, comment.likeCount);
      } else {
        await likeComment(commentId, comment.likeCount);
      }
    } catch {
      toast.error('Failed to update comment like');
    }
  };

  const onSendComment = async (body: string): Promise<boolean> => {
    if (!body.trim() || !postId) return false;
    setSending(true);
    try {
      const result = await createComment(body);
      if (!result.data?.createComment.success) {
        toast.error(result.data?.createComment.message ?? 'Failed to post comment');
        return false;
      }
      return true;
    } catch {
      toast.error('Failed to post comment');
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    post,
    loading,
    error,
    liked,
    likeCount,
    bookmarked,
    comments,
    sending,
    onLikePost,
    onLikeComment,
    onSendComment,
    onToggleBookmark: toggleBookmark,
  };
}
