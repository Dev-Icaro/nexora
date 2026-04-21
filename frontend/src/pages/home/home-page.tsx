import { PostComposer } from '@/features/post/components/post-composer';
import { PostFeed } from '@/features/post/components/post-feed';
import { useFeed } from '@/features/post/hooks/use-feed';

export function HomePage() {
  const { posts, loading, isFetchingNextPage, error, paginationError, refetch, fetchNextPage, hasNextPage } = useFeed();

  return (
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        <PostComposer />
        <PostFeed
          posts={posts}
          loading={loading}
          isFetchingNextPage={isFetchingNextPage}
          error={error}
          paginationError={paginationError}
          hasNextPage={hasNextPage}
          onRetry={refetch}
          onLoadMore={fetchNextPage}
        />
      </div>
    </main>
  );
}
