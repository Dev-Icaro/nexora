import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { PostFeed } from '@/features/post/components/post-feed';
import { useUserPosts } from '@/features/post/hooks/use-user-posts';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

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
    <main className="max-w-2xl w-full mx-auto px-4 py-6 space-y-3">
      {user && <ProfileHeader isOwnProfile={isOwnProfile} user={user} />}

      <Tabs defaultValue="posts" className="gap-3">
        <TabsList className="h-auto w-full rounded-2xl border border-border bg-card gap-3 py-5">
          <TabsTrigger
            value="posts"
            className="h-auto flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-all text-muted-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-transparent"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="h-auto flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-all text-muted-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-transparent"
          >
            Media
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="h-auto flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-all text-muted-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-transparent"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
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
        </TabsContent>

        <TabsContent value="media">
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Media coming soon.
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Liked posts are private.
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
