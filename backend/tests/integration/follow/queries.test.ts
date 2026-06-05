import { beforeEach, describe, expect, it } from 'vitest';

import { Follow } from '@/models/follow.model';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const GET_USER_FOLLOWERS = `
  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {
    getUserFollowers(userId: $userId, first: $first, after: $after) {
      edges {
        node { id username }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const GET_USER_FOLLOWINGS = `
  query GetUserFollowings($userId: ID!, $first: Int, $after: String) {
    getUserFollowings(userId: $userId, first: $first, after: $after) {
      edges {
        node { id username }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

async function createFollow(followerId: string, followingId: string) {
  return Follow.create({ followerId, followingId });
}

describe('getUserFollowers', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns followers of a user', async () => {
    const target = await createTestUser();
    const alice = await createTestUser();
    const bob = await createTestUser();
    await createFollow(alice.id, target.id);
    await createFollow(bob.id, target.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 10 } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowers as { edges: Array<{ node: { id: string } }> };
    expect(result.edges).toHaveLength(2);
    const ids = result.edges.map(e => e.node.id);
    expect(ids).toContain(alice.id);
    expect(ids).toContain(bob.id);
  });

  it('returns empty edges when the user has no followers', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: user.id, first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowers as { edges: unknown[]; pageInfo: { hasNextPage: boolean } };
    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
  });

  it('does not include users who follow someone else', async () => {
    const target = await createTestUser();
    const other = await createTestUser();
    const follower = await createTestUser();
    await createFollow(follower.id, other.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 10 } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowers as { edges: unknown[] };
    expect(result.edges).toHaveLength(0);
  });

  it('respects the first limit and sets hasNextPage', async () => {
    const target = await createTestUser();
    for (let i = 0; i < 4; i++) {
      const follower = await createTestUser();
      await createFollow(follower.id, target.id);
    }

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 2 } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowers as { edges: unknown[]; pageInfo: { hasNextPage: boolean } };
    expect(result.edges).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('paginates forward using the endCursor', async () => {
    const target = await createTestUser();
    for (let i = 0; i < 3; i++) {
      const follower = await createTestUser();
      await createFollow(follower.id, target.id);
    }

    type Connection = {
      edges: Array<{ node: { id: string }; cursor: string }>;
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };

    const firstPage = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 2 } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );
    const page1 = firstPage.data?.getUserFollowers as Connection;
    expect(page1.edges).toHaveLength(2);
    expect(page1.pageInfo.hasNextPage).toBe(true);

    const secondPage = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 2, after: page1.pageInfo.endCursor } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );
    const page2 = secondPage.data?.getUserFollowers as Connection;
    expect(page2.edges).toHaveLength(1);
    expect(page2.pageInfo.hasNextPage).toBe(false);

    const allIds = [...page1.edges.map(e => e.node.id), ...page2.edges.map(e => e.node.id)];
    expect(new Set(allIds).size).toBe(3);
  });

  it('sets hasPreviousPage when an after cursor is provided', async () => {
    const target = await createTestUser();
    const a = await createTestUser();
    const b = await createTestUser();
    await createFollow(a.id, target.id);
    await createFollow(b.id, target.id);

    type Connection = { edges: Array<{ cursor: string }>; pageInfo: { hasPreviousPage: boolean; endCursor: string } };

    const firstPage = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 1 } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );
    const page1 = firstPage.data?.getUserFollowers as Connection;

    const secondPage = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWERS, variables: { userId: target.id, first: 1, after: page1.pageInfo.endCursor } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );
    const page2 = secondPage.data?.getUserFollowers as Connection;
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });
});

describe('getUserFollowings', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns the users that a given user is following', async () => {
    const follower = await createTestUser();
    const alice = await createTestUser();
    const bob = await createTestUser();
    await createFollow(follower.id, alice.id);
    await createFollow(follower.id, bob.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWINGS, variables: { userId: follower.id, first: 10 } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowings as { edges: Array<{ node: { id: string } }> };
    expect(result.edges).toHaveLength(2);
    const ids = result.edges.map(e => e.node.id);
    expect(ids).toContain(alice.id);
    expect(ids).toContain(bob.id);
  });

  it('returns empty edges when the user follows nobody', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWINGS, variables: { userId: user.id, first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowings as { edges: unknown[]; pageInfo: { hasNextPage: boolean } };
    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
  });

  it('does not include users followed by someone else', async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const target = await createTestUser();
    await createFollow(other.id, target.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWINGS, variables: { userId: user.id, first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowings as { edges: unknown[] };
    expect(result.edges).toHaveLength(0);
  });

  it('respects the first limit and sets hasNextPage', async () => {
    const follower = await createTestUser();
    for (let i = 0; i < 4; i++) {
      const target = await createTestUser();
      await createFollow(follower.id, target.id);
    }

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWINGS, variables: { userId: follower.id, first: 2 } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserFollowings as { edges: unknown[]; pageInfo: { hasNextPage: boolean } };
    expect(result.edges).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('paginates forward using the endCursor', async () => {
    const follower = await createTestUser();
    for (let i = 0; i < 3; i++) {
      const target = await createTestUser();
      await createFollow(follower.id, target.id);
    }

    type Connection = {
      edges: Array<{ node: { id: string }; cursor: string }>;
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };

    const firstPage = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWINGS, variables: { userId: follower.id, first: 2 } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );
    const page1 = firstPage.data?.getUserFollowings as Connection;
    expect(page1.edges).toHaveLength(2);
    expect(page1.pageInfo.hasNextPage).toBe(true);

    const secondPage = singleResult(
      await server.executeOperation(
        { query: GET_USER_FOLLOWINGS, variables: { userId: follower.id, first: 2, after: page1.pageInfo.endCursor } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );
    const page2 = secondPage.data?.getUserFollowings as Connection;
    expect(page2.edges).toHaveLength(1);
    expect(page2.pageInfo.hasNextPage).toBe(false);

    const allIds = [...page1.edges.map(e => e.node.id), ...page2.edges.map(e => e.node.id)];
    expect(new Set(allIds).size).toBe(3);
  });
});
