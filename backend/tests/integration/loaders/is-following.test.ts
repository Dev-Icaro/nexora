import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Follow } from '@/models/follow.model';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const GET_USERS_IS_FOLLOWING = `
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      id
      username
      isFollowing
    }
  }
`;

const GET_POSTS = `
  query GetPosts {
    getPosts {
      id
      author {
        id
        isFollowing
      }
    }
  }
`;

const FOLLOW_USER = `
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      code
      success
    }
  }
`;

describe('isFollowing field resolver', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('resolves true for a user the viewer follows', async () => {
    const viewer = await createTestUser();
    const target = await createTestUser();

    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: target.id } },
      { contextValue: buildContext({ userId: viewer.id }) },
    );

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USERS_IS_FOLLOWING, variables: { userId: target.id } },
        { contextValue: buildContext({ userId: viewer.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.getUserById).toMatchObject({ isFollowing: true });
  });

  it('resolves false for a user the viewer does not follow', async () => {
    const viewer = await createTestUser();
    const target = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USERS_IS_FOLLOWING, variables: { userId: target.id } },
        { contextValue: buildContext({ userId: viewer.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.getUserById).toMatchObject({ isFollowing: false });
  });

  it('resolves null when the viewer is unauthenticated', async () => {
    const target = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USERS_IS_FOLLOWING, variables: { userId: target.id } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.getUserById).toMatchObject({ isFollowing: null });
  });

  it('batches multiple isFollowing checks into a single DB query', async () => {
    const { createTestPost } = await import('../../setup/factories/post.factory');
    const viewer = await createTestUser();
    const alice = await createTestUser();
    const bob = await createTestUser();

    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: alice.id } },
      { contextValue: buildContext({ userId: viewer.id }) },
    );

    await createTestPost(alice.id, { body: 'Post by Alice' });
    await createTestPost(bob.id, { body: 'Post by Bob' });
    await createTestPost(alice.id, { body: 'Second post by Alice' });

    const findSpy = vi.spyOn(Follow, 'find');

    const { data, errors } = singleResult(
      await server.executeOperation({ query: GET_POSTS }, { contextValue: buildContext({ userId: viewer.id }) }),
    );

    expect(errors).toBeUndefined();
    const posts = data?.getPosts as Array<{ author: { id: string; isFollowing: boolean | null } }>;
    expect(posts).toHaveLength(3);

    const alicePosts = posts.filter(p => p.author.id === alice.id);
    const bobPosts = posts.filter(p => p.author.id === bob.id);
    expect(alicePosts.every(p => p.author.isFollowing === true)).toBe(true);
    expect(bobPosts.every(p => p.author.isFollowing === false)).toBe(true);

    const followFindCalls = findSpy.mock.calls.filter(([query]) => query && 'followerId' in (query as object));
    expect(followFindCalls.length).toBe(1);

    findSpy.mockRestore();
  });
});
