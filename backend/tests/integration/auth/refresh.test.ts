import { beforeEach, describe, expect, it } from 'vitest';

import settings from '@/config/settings';
import { Session } from '@/models/session.model';
import { createAccessToken, createHashForRefreshToken, createRefreshToken } from '@/utils/auth';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const REFRESH = `
  mutation Refresh {
    refresh {
      code
      success
      accessToken
      user { id email }
    }
  }
`;

const LOGOUT = `
  mutation Logout {
    logout {
      code
      success
    }
  }
`;

async function seedRefreshToken(userId: string) {
  const refreshToken = createRefreshToken({ userId });
  const hash = createHashForRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({ userId, refreshTokenHash: hash, expiresAt });
  return refreshToken;
}

describe('refresh', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns a new access token and sets a new refresh cookie', async () => {
    const user = await createTestUser();
    const refreshToken = await seedRefreshToken(user.id);

    const ctx = buildContext({ cookies: { [settings.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } });
    const { data, errors } = singleResult(await server.executeOperation({ query: REFRESH }, { contextValue: ctx }));

    expect(errors).toBeUndefined();
    expect(data?.refresh).toMatchObject({ code: 200, success: true });
    expect((data?.refresh as { accessToken: string; user: { id: string } }).accessToken).toBeDefined();
    expect((data?.refresh as { user: { id: string } }).user.id).toBe(user.id);

    const setCookieMock = ctx.res.cookie as ReturnType<typeof import('vitest').vi.fn>;
    expect(setCookieMock).toHaveBeenCalledWith(
      settings.REFRESH_TOKEN_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('returns UNAUTHENTICATED when no cookie is present', async () => {
    const { errors } = singleResult(
      await server.executeOperation({ query: REFRESH }, { contextValue: buildContext() }),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('returns UNAUTHENTICATED for an unknown or expired refresh token', async () => {
    const staleToken = createRefreshToken({ userId: 'nonexistent-id' });
    const ctx = buildContext({ cookies: { [settings.REFRESH_TOKEN_COOKIE_NAME]: staleToken } });
    const { errors } = singleResult(await server.executeOperation({ query: REFRESH }, { contextValue: ctx }));

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('UNAUTHENTICATED');
  });
});

describe('logout', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('removes the refresh token and clears the cookie', async () => {
    const user = await createTestUser();
    const refreshToken = await seedRefreshToken(user.id);

    const ctx = buildContext({ cookies: { [settings.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } });
    const { errors } = singleResult(await server.executeOperation({ query: LOGOUT }, { contextValue: ctx }));

    expect(errors).toBeUndefined();

    const clearCookieMock = ctx.res.clearCookie as ReturnType<typeof import('vitest').vi.fn>;
    expect(clearCookieMock).toHaveBeenCalledWith(settings.REFRESH_TOKEN_COOKIE_NAME);

    const remainingSessions = await Session.countDocuments({ userId: user.id });
    expect(remainingSessions).toBe(0);
  });

  it('succeeds silently when no cookie is present', async () => {
    const { data, errors } = singleResult(
      await server.executeOperation({ query: LOGOUT }, { contextValue: buildContext() }),
    );

    expect(errors).toBeUndefined();
    expect(data?.logout).toMatchObject({ code: 200, success: true });
  });
});

describe('access token used as refresh token', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns UNAUTHENTICATED when an access token is sent as the refresh cookie', async () => {
    const user = await createTestUser();
    const accessToken = createAccessToken({ userId: user.id });

    const ctx = buildContext({ cookies: { [settings.REFRESH_TOKEN_COOKIE_NAME]: accessToken } });
    const { errors } = singleResult(await server.executeOperation({ query: REFRESH }, { contextValue: ctx }));

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('UNAUTHENTICATED');
  });
});
