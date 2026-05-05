import { useState } from 'react';

import type { PostNode } from '../api/post.types';

const MOCK_PENDING_POSTS: PostNode[] = [
  {
    id: 'mock-pending-1',
    body: 'Just launched something amazing! Cannot wait to share it with everyone. #excited #tech',
    mediaUrl: null,
    createdAt: new Date().toISOString(),
    author: { id: 'mock-author-1', username: 'aliceDev' },
    likeCount: 0,
    commentCount: 0,
    likes: [],
  },
  {
    id: 'mock-pending-2',
    body: 'What a beautiful day to build great things! #motivation #buildinpublic',
    mediaUrl: null,
    createdAt: new Date().toISOString(),
    author: { id: 'mock-author-2', username: 'bobDesigns' },
    likeCount: 0,
    commentCount: 0,
    likes: [],
  },
];

type UseNewPostsNotificationResult = {
  pendingCount: number;
  hasPending: boolean;
  flush: () => void;
};

export function useNewPostsNotification(onFlush: (posts: PostNode[]) => void): UseNewPostsNotificationResult {
  const [pendingPosts, setPendingPosts] = useState<PostNode[]>(MOCK_PENDING_POSTS);

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
