import { PostCard } from '@/features/post/components/post-card';

import type { PostNode } from '../api/post.types';
import { PostFeedEmpty } from './post-feed-empty';
import { PostFeedError } from './post-feed-error';
import { PostFeedInlineError } from './post-feed-inline-error';
import { PostFeedSkeleton } from './post-feed-skeleton';

type PostFeedProps = {
  posts: PostNode[];
  loading: boolean;
  error?: string;
  paginationError?: string;
  hasNextPage: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
};

export function PostFeed({ posts, loading, error, paginationError, hasNextPage, onRetry, onLoadMore }: PostFeedProps) {
  const hasPosts = posts.length > 0;

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
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {paginationError ? <PostFeedInlineError message={paginationError} onRetry={onLoadMore} /> : null}
      {hasNextPage && !paginationError ? (
        <div className="flex justify-center">
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={onLoadMore}>
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
