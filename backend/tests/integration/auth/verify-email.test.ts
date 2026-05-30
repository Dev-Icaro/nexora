import { beforeEach, describe, expect, it } from 'vitest';

import { EmailVerificationToken } from '@/models/email-verification-token.model';
import { Session } from '@/models/session.model';
import { User } from '@/models/user.model';
import { generateEmailVerificationToken, hashEmailVerificationToken } from '@/utils/crypto';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const VERIFY_EMAIL = `
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      code
      success
      message
      accessToken
      user {
        id
        email
        username
      }
    }
  }
`;

async function seedVerificationToken(userId: string, overrides: { expiresAt?: Date } = {}) {
  const raw = generateEmailVerificationToken();
  await EmailVerificationToken.create({
    userId,
    tokenHash: hashEmailVerificationToken(raw),
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000),
  });
  return raw;
}

describe('verifyEmail', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('marks the account as verified, deletes the token, and returns a session', async () => {
    const user = await createTestUser({ emailVerified: false });
    const token = await seedVerificationToken(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation({ query: VERIFY_EMAIL, variables: { token } }, { contextValue: buildContext() }),
    );

    expect(errors).toBeUndefined();
    expect(data?.verifyEmail).toMatchObject({ code: 200, success: true });
    expect((data?.verifyEmail as Record<string, unknown>).accessToken).toBeTruthy();
    expect((data?.verifyEmail as Record<string, unknown>).user).toMatchObject({ email: user.email });

    const updatedUser = await User.findById(user.id);
    expect(updatedUser?.emailVerified).toBe(true);

    const remainingTokens = await EmailVerificationToken.find({ userId: user.id });
    expect(remainingTokens).toHaveLength(0);

    const sessions = await Session.find({ userId: user.id });
    expect(sessions).toHaveLength(1);
  });

  it('returns BAD_USER_INPUT for an expired token', async () => {
    const user = await createTestUser({ emailVerified: false });
    const token = await seedVerificationToken(user.id, { expiresAt: new Date(Date.now() - 1000) });

    const { errors } = singleResult(
      await server.executeOperation({ query: VERIFY_EMAIL, variables: { token } }, { contextValue: buildContext() }),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('returns BAD_USER_INPUT for a non-existent token', async () => {
    const { errors } = singleResult(
      await server.executeOperation(
        { query: VERIFY_EMAIL, variables: { token: generateEmailVerificationToken() } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('returns BAD_USER_INPUT when the token has already been consumed', async () => {
    const user = await createTestUser({ emailVerified: false });
    const token = await seedVerificationToken(user.id);

    await server.executeOperation({ query: VERIFY_EMAIL, variables: { token } }, { contextValue: buildContext() });

    const { errors } = singleResult(
      await server.executeOperation({ query: VERIFY_EMAIL, variables: { token } }, { contextValue: buildContext() }),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });
});
