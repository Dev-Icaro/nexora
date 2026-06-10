import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useFollow } from '@/features/follow/hooks/use-follow';
import { NewPostsAnchor } from '@/features/post/components/new-posts-anchor';
import { PostComposer } from '@/features/post/components/post-composer';
import { PostDetailModal } from '@/features/post/components/post-detail-modal';
import { PostFeed } from '@/features/post/components/post-feed';
import { useCreatePost } from '@/features/post/hooks/use-create-post';
import { useFeed } from '@/features/post/hooks/use-feed';
import { useNewPostsNotification } from '@/features/post/hooks/use-new-posts-notification';
import { useUploadPostMedia } from '@/features/post/hooks/use-upload-post-media';
import { usePageTitle } from '@/shared/hooks/use-page-title';

export function HomePage() {
  usePageTitle('Feed');
  const { state } = useAuth();
  const username = state.user?.username ?? '';
  const { id: selectedPostId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { follow } = useFollow();
  const { createPost } = useCreatePost();
  const { uploadPostMedia } = useUploadPostMedia();
  const [isUploadingPost, setIsUploadingPost] = useState(false);
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
    prependPosts,
  } = useFeed();

  const { pendingCount, hasPending, flush } = useNewPostsNotification(posts, prependPosts);

  const handleCreatePost = async (body: string, mediaFile?: File): Promise<boolean> => {
    setIsUploadingPost(true);
    try {
      let objectKey: string | undefined;
      if (mediaFile) {
        objectKey = await uploadPostMedia(mediaFile);
        if (!objectKey) return false;
      }
      const post = await createPost(body, objectKey);
      if (post) {
        prependPost(post);
        return true;
      }
      return false;
    } finally {
      setIsUploadingPost(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      {hasPending && <NewPostsAnchor count={pendingCount} onClick={flush} />}
      <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-4">
        <PostComposer username={username} loading={isUploadingPost} onSubmit={handleCreatePost} />
        <PostFeed
          posts={posts}
          loading={loading}
          isFetchingNextPage={isFetchingNextPage}
          isUploadingPost={isUploadingPost}
          error={error}
          paginationError={paginationError}
          hasNextPage={hasNextPage}
          onRetry={refetch}
          onLoadMore={fetchNextPage}
          onOpenPost={postId => navigate(`/posts/${postId}`)}
          onFollow={follow}
        />
      </div>
      <PostDetailModal postId={selectedPostId ?? null} open={!!selectedPostId} onClose={() => navigate(-1)} />
    </main>
  );
}
