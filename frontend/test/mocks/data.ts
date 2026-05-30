import type { AuthUser } from '@/features/auth/state/auth-reducer';
import type { PostNode } from '@/features/post/api/post.queries';
import type { GetProfileQuery } from '@/gql/graphql';

export function makeUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    avatarUrl: null,
    ...overrides,
  };
}

export function makePost(overrides?: Partial<PostNode>): PostNode {
  return {
    id: 'post-1',
    body: 'Test post body',
    mediaUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    author: {
      id: 'user-1',
      username: 'testuser',
      avatarUrl: null,
    },
    likeCount: 0,
    commentCount: 0,
    likes: [],
    ...overrides,
  };
}

type ProfileUser = NonNullable<GetProfileQuery['getUserById']>;

export function makeProfileUser(overrides?: Partial<ProfileUser>): ProfileUser {
  return {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    bio: null,
    position: null,
    avatarUrl: null,
    followersCount: 0,
    followingCount: 0,
    postCount: 0,
    isFollowing: null,
    storageInfo: {
      usedBytes: 0,
      quotaBytes: 104_857_600,
      remainingBytes: 104_857_600,
      usedPercent: 0,
    },
    ...overrides,
  };
}

export function makeFeedPage(
  posts: PostNode[] = [makePost()],
  pageInfo: { hasNextPage: boolean; endCursor: string | null } = {
    hasNextPage: false,
    endCursor: null,
  },
) {
  return {
    feed: {
      edges: posts.map((node, i) => ({ cursor: `cursor-${i}`, node })),
      pageInfo,
    },
  };
}
