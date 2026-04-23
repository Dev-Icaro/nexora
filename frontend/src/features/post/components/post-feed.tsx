import { useEffect, useState } from 'react';

import { PostCard } from '@/features/post/components/post-card';

import type { PostNode } from '../api/post.types';
import { PostFeedEmpty } from './post-feed-empty';
import { PostFeedError } from './post-feed-error';
import { PostFeedInlineError } from './post-feed-inline-error';
import { PostFeedSkeleton } from './post-feed-skeleton';

type PostFeedProps = {
  posts: PostNode[];
  loading: boolean;
  isFetchingNextPage: boolean;
  error?: string;
  paginationError?: string;
  hasNextPage: boolean;
  onRetry: () => void;
  onLoadMore: () => Promise<void>;
  onOpenPost?: (postId: string) => void;
};

export function PostFeed({
  posts,
  loading,
  isFetchingNextPage,
  error,
  paginationError,
  hasNextPage,
  onRetry,
  onLoadMore,
  onOpenPost,
}: PostFeedProps) {
  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(null);
  const hasPosts = posts.length > 0;

  useEffect(() => {
    if (!observedElement || !hasNextPage || isFetchingNextPage || paginationError) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: '0px 0px 240px 0px',
      },
    );

    observer.observe(observedElement);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, observedElement, onLoadMore, paginationError]);

  if (loading && !hasPosts) {
    return <PostFeedSkeleton />;
  }

  if (error && !hasPosts) {
    return <PostFeedError message={error} onRetry={onRetry} />;
  }

  if (!loading && !error && !hasPosts) {
    return <PostFeedEmpty />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        const observedIndex = posts.length > 1 ? posts.length - 2 : posts.length - 1;
        const isObservedPost = index === observedIndex;

        return (
          <div key={post.id} ref={isObservedPost ? setObservedElement : null}>
            <PostCard post={post} onOpenModal={onOpenPost} />
          </div>
        );
      })}
      {isFetchingNextPage ? (
        <div className="flex justify-center py-2">
          <span className="text-sm text-muted-foreground">Loading more posts...</span>
        </div>
      ) : null}
      {paginationError ? <PostFeedInlineError message={paginationError} onRetry={onLoadMore} /> : null}
    </div>
  );
}
