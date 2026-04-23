import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { PostComposer } from '@/features/post/components/post-composer';
import { PostDetailModal } from '@/features/post/components/post-detail-modal';
import { PostFeed } from '@/features/post/components/post-feed';
import { useCreatePost } from '@/features/post/hooks/use-create-post';
import { useFeed } from '@/features/post/hooks/use-feed';
import { fileToDataUrl } from '@/features/post/utils/file-to-data-url';

export function HomePage() {
  const { state } = useAuth();
  const username = state.user?.username ?? '';
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { createPost, loading: createPostLoading } = useCreatePost();
  const {
    posts,
    loading,
    isFetchingNextPage,
    error,
    paginationError,
    refetch,
    fetchNextPage,
    hasNextPage,
    prependPost,
  } = useFeed();

  const handleCreatePost = async (body: string, mediaFile?: File): Promise<boolean> => {
    let mediaUrl: string | undefined;
    if (mediaFile) mediaUrl = await fileToDataUrl(mediaFile);
    const post = await createPost(body, mediaUrl);
    if (post) {
      prependPost(post);
      return true;
    }
    return false;
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        <PostComposer username={username} loading={createPostLoading} onSubmit={handleCreatePost} />
        <PostFeed
          posts={posts}
          loading={loading}
          isFetchingNextPage={isFetchingNextPage}
          error={error}
          paginationError={paginationError}
          hasNextPage={hasNextPage}
          onRetry={refetch}
          onLoadMore={fetchNextPage}
          onOpenPost={setSelectedPostId}
        />
      </div>
      <PostDetailModal postId={selectedPostId} open={!!selectedPostId} onClose={() => setSelectedPostId(null)} />
    </main>
  );
}
