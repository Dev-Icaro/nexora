import { beforeEach, describe, expect, it } from 'vitest';

import { EmailVerificationToken } from '@/models/email-verification-token.model';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createMockEmailService } from '../../setup/mocks/email.mock';
import { createTestServer, singleResult } from '../../setup/server';

const REGISTER = `
  mutation Register($input: RegisterRequest!) {
    register(registerRequest: $input)
  }
`;

const validInput = {
  username: 'alice',
  email: 'alice@nexora.test',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

describe('register', () => {
  const emailService = createMockEmailService();
  const { server, buildContext } = createTestServer({ emailService });

  beforeEach(async () => {
    await clearDb();
    emailService.sendEmail.mockClear();
  });

  it('returns true and sends one verification email on successful registration', async () => {
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REGISTER, variables: { input: validInput } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.register).toBe(true);
    expect(emailService.sendEmail).toHaveBeenCalledOnce();
    expect(emailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@nexora.test' }));
  });

  it('re-registration of an unverified email sends a new email and invalidates the old token', async () => {
    const user = await createTestUser({ email: 'alice@nexora.test', emailVerified: false });
    const oldTokenHash = 'aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222';
    await EmailVerificationToken.create({
      userId: user.id,
      tokenHash: oldTokenHash,
      expiresAt: new Date(Date.now() + 3_600_000),
    });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REGISTER, variables: { input: validInput } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.register).toBe(true);
    expect(emailService.sendEmail).toHaveBeenCalledOnce();

    const tokensAfter = await EmailVerificationToken.find({});
    expect(tokensAfter).toHaveLength(1);
    expect(tokensAfter[0].tokenHash).not.toBe(oldTokenHash);
  });

  it('returns CONFLICT when email is already registered and verified', async () => {
    await createTestUser({ email: 'alice@nexora.test', emailVerified: true });

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
