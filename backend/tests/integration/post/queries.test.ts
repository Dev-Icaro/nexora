import { beforeEach, describe, expect, it } from 'vitest';

import { Bookmark } from '@/models/bookmark.model';
import { clearDb } from '../../setup/db';
import { createTestPost } from '../../setup/factories/post.factory';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const GET_POST = `
  query GetPost($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      createdAt
      likeCount
      commentCount
      author { id username }
    }
  }
`;

const FEED = `
  query Feed($first: Int, $after: String) {
    feed(first: $first, after: $after) {
      edges {
        node { id body }
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

const GET_USER_POSTS = `
  query GetUserPosts($userId: ID!, $first: Int) {
    getUserPosts(userId: $userId, first: $first) {
      edges { node { id body } }
      pageInfo { hasNextPage }
    }
  }
`;

describe('getPost', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns the post with author resolved', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id, { body: 'Hello world' });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_POST, variables: { postId: post.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getPost as { id: string; body: string; author: { id: string } };
    expect(result.id).toBe(post.id);
    expect(result.body).toBe('Hello world');
    expect(result.author.id).toBe(user.id);
  });

  it('returns null for a non-existent postId', async () => {
    const user = await createTestUser();
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_POST, variables: { postId: '000000000000000000000000' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.getPost).toBeNull();
  });
});

describe('feed', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns posts in a paginated connection', async () => {
    const user = await createTestUser();
    await createTestPost(user.id, { body: 'Post A' });
    await createTestPost(user.id, { body: 'Post B' });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: FEED, variables: { first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const feed = data?.feed as { edges: Array<{ node: { body: string } }> };
    expect(feed.edges).toHaveLength(2);
  });

  it('respects the first limit', async () => {
    const user = await createTestUser();
    for (let i = 0; i < 5; i++) await createTestPost(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: FEED, variables: { first: 2 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const feed = data?.feed as { edges: unknown[]; pageInfo: { hasNextPage: boolean } };
    expect(feed.edges).toHaveLength(2);
    expect(feed.pageInfo.hasNextPage).toBe(true);
  });

  it('returns empty edges when no posts exist', async () => {
    const user = await createTestUser();
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: FEED, variables: { first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const feed = data?.feed as { edges: unknown[] };
    expect(feed.edges).toHaveLength(0);
  });
});

describe('getUserPosts', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns only the target user posts', async () => {
    const alice = await createTestUser();
    const bob = await createTestUser();
    await createTestPost(alice.id, { body: 'Alice post' });
    await createTestPost(bob.id, { body: 'Bob post' });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_POSTS, variables: { userId: alice.id, first: 10 } },
        { contextValue: buildContext({ userId: alice.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserPosts as { edges: Array<{ node: { body: string } }> };
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node.body).toBe('Alice post');
  });
});

const GET_BOOKMARKED = `
  query GetBookmarked($first: Int, $after: String) {
    getBookmarked(first: $first, after: $after) {
      edges {
        node { id body isBookmarked }
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

describe('getBookmarked', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns only the posts bookmarked by the current user', async () => {
    const alice = await createTestUser();
    const bob = await createTestUser();
    const alicePost = await createTestPost(alice.id, { body: 'Alice post' });
    const bobPost = await createTestPost(bob.id, { body: 'Bob post' });

    await Bookmark.create({ userId: alice.id, postId: alicePost.id });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_BOOKMARKED, variables: { first: 10 } },
        { contextValue: buildContext({ userId: alice.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getBookmarked as { edges: Array<{ node: { id: string; body: string } }> };
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].node.id).toBe(alicePost.id);
    expect(result.edges[0].node.body).toBe('Alice post');
    expect(result.edges.map(e => e.node.id)).not.toContain(bobPost.id);
  });

  it('returns empty edges when the user has no bookmarks', async () => {
    const user = await createTestUser();
    await createTestPost(user.id, { body: 'Unbookmarked post' });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_BOOKMARKED, variables: { first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getBookmarked as { edges: unknown[] };
    expect(result.edges).toHaveLength(0);
  });

  it('resolves isBookmarked as true for each returned post', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    await Bookmark.create({ userId: user.id, postId: post.id });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_BOOKMARKED, variables: { first: 10 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getBookmarked as { edges: Array<{ node: { isBookmarked: boolean } }> };
    expect(result.edges[0].node.isBookmarked).toBe(true);
  });

  it('respects the first limit and sets hasNextPage', async () => {
    const user = await createTestUser();
    const posts = await Promise.all(Array.from({ length: 5 }, () => createTestPost(user.id)));
    await Promise.all(posts.map(p => Bookmark.create({ userId: user.id, postId: p.id })));

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_BOOKMARKED, variables: { first: 2 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getBookmarked as { edges: unknown[]; pageInfo: { hasNextPage: boolean } };
    expect(result.edges).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('paginates using the after cursor', async () => {
    const user = await createTestUser();
    const posts = await Promise.all(
      Array.from({ length: 3 }, (_, i) => createTestPost(user.id, { body: `Post ${i}` })),
    );
    await Promise.all(posts.map(p => Bookmark.create({ userId: user.id, postId: p.id })));

    const firstPage = singleResult(
      await server.executeOperation(
        { query: GET_BOOKMARKED, variables: { first: 2 } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );
    const endCursor = (firstPage.data?.getBookmarked as { pageInfo: { endCursor: string } }).pageInfo.endCursor;
    const firstIds = (firstPage.data?.getBookmarked as { edges: Array<{ node: { id: string } }> }).edges.map(
      e => e.node.id,
    );

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_BOOKMARKED, variables: { first: 10, after: endCursor } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const secondPage = data?.getBookmarked as {
      edges: Array<{ node: { id: string } }>;
      pageInfo: { hasNextPage: boolean };
    };
    expect(secondPage.edges).toHaveLength(1);
    expect(firstIds).not.toContain(secondPage.edges[0].node.id);
    expect(secondPage.pageInfo.hasNextPage).toBe(false);
  });
});
