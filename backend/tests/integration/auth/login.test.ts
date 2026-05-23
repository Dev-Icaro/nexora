import { beforeEach, describe, expect, it } from 'vitest';

import settings from '@/config/settings';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const LOGIN = `
  mutation Login($input: LoginRequest!) {
    login(loginRequest: $input) {
      code
      success
      accessToken
      user { id email username }
    }
  }
`;

describe('login', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('returns an access token and sets the refresh cookie', async () => {
    const user = await createTestUser({ email: 'bob@nexora.test', plainPassword: 'Password123!' });

    const ctx = buildContext();
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: LOGIN, variables: { input: { email: user.email, password: user.plainPassword } } },
        { contextValue: ctx },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.login).toMatchObject({ code: 200, success: true });
    expect((data?.login as { accessToken: string }).accessToken).toBeDefined();

    const setCookieMock = ctx.res.cookie as ReturnType<typeof import('vitest').vi.fn>;
    expect(setCookieMock).toHaveBeenCalledWith(
      settings.REFRESH_TOKEN_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('returns UNAUTHENTICATED for a wrong password', async () => {
    const user = await createTestUser({ email: 'bob@nexora.test' });

    const { errors } = singleResult(
      await server.executeOperation(
        { query: LOGIN, variables: { input: { email: user.email, password: 'WrongPassword!' } } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('returns UNAUTHENTICATED for an unregistered email', async () => {
    const { errors } = singleResult(
      await server.executeOperation(
        { query: LOGIN, variables: { input: { email: 'ghost@nexora.test', password: 'Password123!' } } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('UNAUTHENTICATED');
  });
});
