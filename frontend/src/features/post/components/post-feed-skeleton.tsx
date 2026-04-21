import { PostCardSkeleton } from './post-card-skeleton';

type PostFeedSkeletonProps = { count?: number };

export function PostFeedSkeleton({ count = 3 }: PostFeedSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
