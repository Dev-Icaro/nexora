import { beforeEach, describe, expect, it } from 'vitest';

import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const REGISTER = `
  mutation Register($input: RegisterRequest!) {
    register(registerRequest: $input) {
      code
      success
      message
      user { id email username }
    }
  }
`;

const validInput = {
  username: 'alice',
  email: 'alice@nexora.test',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

describe('register', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('creates a new user and returns 201', async () => {
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REGISTER, variables: { input: validInput } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.register).toMatchObject({
      code: 201,
      success: true,
    });
    expect((data?.register as { user: { email: string } }).user.email).toBe('alice@nexora.test');
    expect((data?.register as { user: { id: string } }).user.id).toBeDefined();
  });

  it('returns CONFLICT when email is already registered', async () => {
    await createTestUser({ email: 'alice@nexora.test' });

    const { errors } = singleResult(
      await server.executeOperation(
        { query: REGISTER, variables: { input: validInput } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('CONFLICT');
  });

  it('returns BAD_USER_INPUT when passwords do not match', async () => {
    const { errors } = singleResult(
      await server.executeOperation(
        {
          query: REGISTER,
          variables: { input: { ...validInput, confirmPassword: 'Different123!' } },
        },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });
});
