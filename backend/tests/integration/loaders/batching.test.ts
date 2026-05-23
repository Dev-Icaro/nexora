import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '@/models/user.model';
import { clearDb } from '../../setup/db';
import { createTestPost } from '../../setup/factories/post.factory';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const GET_POSTS = `
  query GetPosts {
    getPosts {
      id
      body
      author { id username }
      comments { id body }
      likes { id }
    }
  }
`;

describe('DataLoader batching', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('resolves authors for multiple posts in a single DB query', async () => {
    const alice = await createTestUser();
    const bob = await createTestUser();

    await createTestPost(alice.id, { body: 'Post by Alice' });
    await createTestPost(bob.id, { body: 'Post by Bob' });
    await createTestPost(alice.id, { body: 'Second post by Alice' });

    const findSpy = vi.spyOn(User, 'find');

    const { data, errors } = singleResult(
      await server.executeOperation({ query: GET_POSTS }, { contextValue: buildContext({ userId: alice.id }) }),
    );

    expect(errors).toBeUndefined();
    const posts = data?.getPosts as Array<{ body: string; author: { id: string } }>;
    expect(posts).toHaveLength(3);

    const authorIds = new Set(posts.map(p => p.author.id));
    expect(authorIds.has(alice.id)).toBe(true);
    expect(authorIds.has(bob.id)).toBe(true);

    // DataLoader batches: User.find should be called once for all author IDs
    const userFindCalls = findSpy.mock.calls.filter(([query]) => '_id' in (query as object));
    expect(userFindCalls.length).toBe(1);

    findSpy.mockRestore();
  });
});
