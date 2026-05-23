import { useSubscription } from '@apollo/client/react';
import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';

import type { PostNode } from '../api/post.queries';
import { NEW_POST_SUBSCRIPTION } from '../api/post.queries';

type UseNewPostsNotificationResult = {
  pendingCount: number;
  hasPending: boolean;
  flush: () => void;
};

export function useNewPostsNotification(
  feedPosts: PostNode[],
  onFlush: (posts: PostNode[]) => void,
): UseNewPostsNotificationResult {
  const [pendingPosts, setPendingPosts] = useState<PostNode[]>([]);
  const { state } = useAuth();
  const currentUserId = state.user?.id;

  useSubscription(NEW_POST_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newPost = data.data?.newPost;
      if (!newPost) return;
      if (newPost.author.id === currentUserId) return;

      setPendingPosts(prev => {
        const existingIds = new Set([...feedPosts.map(p => p.id), ...prev.map(p => p.id)]);
        if (existingIds.has(newPost.id)) return prev;
        return [...prev, newPost];
      });
    },
  });

  const pendingCount = pendingPosts.length;
  const hasPending = pendingCount > 0;

  const flush = () => {
    if (!hasPending) return;
    onFlush(pendingPosts);
    setPendingPosts([]);
    document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { pendingCount, hasPending, flush };
}
