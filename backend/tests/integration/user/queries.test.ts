import { beforeEach, describe, expect, it } from 'vitest';

import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const GET_USER_BY_ID = `
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      id
      email
      username
      storageInfo {
        usedBytes
        quotaBytes
        remainingBytes
        usedPercent
      }
    }
  }
`;

describe('getUserById', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns the user with computed storageInfo', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_BY_ID, variables: { userId: user.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.getUserById as {
      id: string;
      email: string;
      storageInfo: { usedBytes: number; quotaBytes: number; remainingBytes: number; usedPercent: number };
    };
    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.storageInfo.usedBytes).toBe(0);
    expect(result.storageInfo.quotaBytes).toBeGreaterThan(0);
    expect(result.storageInfo.remainingBytes).toBe(result.storageInfo.quotaBytes);
    expect(result.storageInfo.usedPercent).toBe(0);
  });

  it('returns null for a non-existent userId', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: GET_USER_BY_ID, variables: { userId: '000000000000000000000000' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.getUserById).toBeNull();
  });
});
