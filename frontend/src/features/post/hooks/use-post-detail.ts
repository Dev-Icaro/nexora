import { useEffect, useState } from 'react';

import { toast } from '@/shared/lib/toast';

import { useBookmark } from './use-bookmark';
import { usePost } from './use-post';

export function usePostDetail(postId: string | null) {
  const { post, loading, error, likePost, createComment, likeComment, unlikeComment } = usePost(postId);
  const { bookmarked, toggleBookmark } = useBookmark(postId ?? '', post?.isBookmarked);

  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLikedCommentIds(new Set());
  }, [postId]);

  const liked = post?.isLiked ?? false;
  const likeCount = post?.likeCount ?? 0;
  const comments = (post?.comments ?? [])
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map(c => ({ ...c, isLiked: likedCommentIds.has(c.id) }));

  const onLikePost = async () => {
    if (!postId) return;
    try {
      await likePost(liked);
    } catch {
      toast.error('Failed to update like');
    }
  };

  const onLikeComment = async (commentId: string) => {
    const isCurrentlyLiked = likedCommentIds.has(commentId);
    setLikedCommentIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
    try {
      if (isCurrentlyLiked) {
        await unlikeComment(commentId);
      } else {
        await likeComment(commentId);
      }
    } catch {
      setLikedCommentIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyLiked) next.add(commentId);
        else next.delete(commentId);
        return next;
      });
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
