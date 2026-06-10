import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PostFeed } from '@/features/post/components/post-feed';
import { useBookmarkedPosts } from '@/features/post/hooks/use-bookmark';
import { Separator } from '@/shared/components/ui/separator';

function BookmarksEmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Bookmark className="size-8" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[17px] font-semibold">Nothing saved yet</p>
        <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-muted-foreground">
          Tap the bookmark icon on any post to save it here for later.
        </p>
      </div>
    </div>
  );
}

export function BookmarksPage() {
  const navigate = useNavigate();
  const { posts, loading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useBookmarkedPosts();

  return (
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[22px] font-semibold">Bookmarks</h1>
            <p className="text-xs text-muted-foreground">
              {posts.length > 0 ? `${posts.length} saved post(s)` : 'All clear'}
            </p>
          </div>
        </div>

        <Separator />

        {posts.length === 0 && !loading ? (
          <BookmarksEmptyState />
        ) : (
          <PostFeed
            posts={posts}
            loading={loading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onRetry={refetch}
            onLoadMore={fetchNextPage}
            onOpenPost={postId => navigate(`/posts/${postId}`)}
          />
        )}
      </div>
    </main>
  );
}
