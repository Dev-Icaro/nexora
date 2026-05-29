import { beforeEach, describe, expect, it } from 'vitest';

import settings from '@/config/settings';
import { EmailVerificationToken } from '@/models/email-verification-token.model';
import { User } from '@/models/user.model';
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

describe('OAuth login', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('creates new OAuth users with emailVerified: true and no verification token', async () => {
    const ctx = buildContext();

    await ctx.dataSources.authService.loginWithOAuth('google', {
      providerId: 'google-123',
      email: 'alice@gmail.com',
      name: 'alice',
    });

    const user = await User.findOne({ email: 'alice@gmail.com' });
    expect(user).not.toBeNull();
    expect(user!.emailVerified).toBe(true);

    const tokens = await EmailVerificationToken.find({ userId: user!._id });
    expect(tokens).toHaveLength(0);
  });

  it('linking OAuth to an existing unverified account marks it as emailVerified', async () => {
    const existing = await createTestUser({ email: 'carol@nexora.test', emailVerified: false });

    const ctx = buildContext();
    await ctx.dataSources.authService.loginWithOAuth('google', {
      providerId: 'google-789',
      email: existing.email,
      name: existing.username,
    });

    const user = await User.findById(existing.id);
    expect(user!.emailVerified).toBe(true);
  });

  it('OAuth user can log in immediately after account creation via refresh token', async () => {
    const ctx = buildContext();

    const { refreshToken } = await ctx.dataSources.authService.loginWithOAuth('github', {
      providerId: 'github-456',
      email: 'bob@gmail.com',
      name: 'bob',
    });

    const refreshCtx = buildContext({ cookies: { [settings.REFRESH_TOKEN_COOKIE_NAME]: refreshToken } });
    const { data, errors } = singleResult(
      await server.executeOperation({ query: REFRESH }, { contextValue: refreshCtx }),
    );

    expect(errors).toBeUndefined();
    expect(data?.refresh).toMatchObject({ code: 200, success: true });
    expect((data?.refresh as { accessToken: string }).accessToken).toBeDefined();
  });
});
