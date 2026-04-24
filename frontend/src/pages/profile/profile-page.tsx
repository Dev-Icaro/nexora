import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { PostFeed } from '@/features/post/components/post-feed';
import { useUserPosts } from '@/features/post/hooks/use-user-posts';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { useProfile } from '@/features/profile/hooks/use-profile';

export function ProfilePage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const { state } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = userId === state.user?.id;

  const { user: userData } = useProfile(userId);
  const { posts, loading, isFetchingNextPage, error, paginationError, refetch, fetchNextPage, hasNextPage } =
    useUserPosts(userId);

  const user = userData
    ? {
        name: userData.username,
        username: userData.username,
        role: userData.position,
        bio: userData.bio,
        stats: { posts: 0, followers: 0, following: 0 },
      }
    : null;

  return (
    <main className="max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
      {user && <ProfileHeader isOwnProfile={isOwnProfile} user={user} />}
      <PostFeed
        posts={posts}
        loading={loading}
        isFetchingNextPage={isFetchingNextPage}
        error={error}
        paginationError={paginationError}
        hasNextPage={hasNextPage}
        onRetry={refetch}
        onLoadMore={fetchNextPage}
        onOpenPost={postId => navigate(`/posts/${postId}`)}
      />
    </main>
  );
}
