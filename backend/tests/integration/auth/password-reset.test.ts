import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordResetToken } from '@/models/password-reset-token.model';
import { generatePasswordResetToken, hashPasswordResetToken } from '@/utils/crypto';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createMockEmailService } from '../../setup/mocks/email.mock';
import { createTestServer, singleResult } from '../../setup/server';

const REQUEST_RESET = `
  mutation RequestPasswordReset($input: RequestPasswordResetRequest!) {
    requestPasswordReset(requestPasswordResetRequest: $input) {
      code
      success
      message
    }
  }
`;

const VALIDATE_TOKEN = `
  query ValidatePasswordResetToken($token: String!) {
    validatePasswordResetToken(token: $token) {
      code
      success
    }
  }
`;

const APPLY_RESET = `
  mutation ApplyPasswordReset($input: ApplyPasswordResetRequest!) {
    applyPasswordReset(applyPasswordResetRequest: $input) {
      code
      success
      message
    }
  }
`;

describe('requestPasswordReset', () => {
  const emailService = createMockEmailService();
  const { server, buildContext } = createTestServer({ emailService });

  beforeEach(async () => {
    await clearDb();
    vi.clearAllMocks();
  });

  it('sends a reset email when the address is registered', async () => {
    const user = await createTestUser({ email: 'carol@nexora.test' });

    const { errors } = singleResult(
      await server.executeOperation(
        { query: REQUEST_RESET, variables: { input: { email: user.email } } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(emailService.sendEmail).toHaveBeenCalledOnce();
    expect(emailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'carol@nexora.test' }));
  });

  it('succeeds silently when the email is not registered (no leak)', async () => {
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REQUEST_RESET, variables: { input: { email: 'ghost@nexora.test' } } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.requestPasswordReset).toMatchObject({ success: true });
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });
});

describe('validatePasswordResetToken', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  async function seedToken(userId: string, overrides: { expiresAt?: Date; usedAt?: Date } = {}) {
    const raw = generatePasswordResetToken();
    await PasswordResetToken.create({
      userId,
      tokenHash: hashPasswordResetToken(raw),
      expiresAt: overrides.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000),
      usedAt: overrides.usedAt ?? null,
    });
    return raw;
  }

  it('returns success for a valid token', async () => {
    const user = await createTestUser();
    const token = await seedToken(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation({ query: VALIDATE_TOKEN, variables: { token } }, { contextValue: buildContext() }),
    );

    expect(errors).toBeUndefined();
    expect(data?.validatePasswordResetToken).toMatchObject({ success: true });
  });

  it('returns BAD_USER_INPUT for an unknown token', async () => {
    const { errors } = singleResult(
      await server.executeOperation(
        { query: VALIDATE_TOKEN, variables: { token: generatePasswordResetToken() } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('returns BAD_USER_INPUT for an expired token', async () => {
    const user = await createTestUser();
    const token = await seedToken(user.id, { expiresAt: new Date(Date.now() - 1000) });

    const { errors } = singleResult(
      await server.executeOperation({ query: VALIDATE_TOKEN, variables: { token } }, { contextValue: buildContext() }),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('returns BAD_USER_INPUT for an already-used token', async () => {
    const user = await createTestUser();
    const token = await seedToken(user.id, { usedAt: new Date() });

    const { errors } = singleResult(
      await server.executeOperation({ query: VALIDATE_TOKEN, variables: { token } }, { contextValue: buildContext() }),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });
});

describe('applyPasswordReset', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  async function seedToken(userId: string) {
    const raw = generatePasswordResetToken();
    await PasswordResetToken.create({
      userId,
      tokenHash: hashPasswordResetToken(raw),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      usedAt: null,
    });
    return raw;
  }

  it('resets the password successfully', async () => {
    const user = await createTestUser();
    const token = await seedToken(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        {
          query: APPLY_RESET,
          variables: {
            input: { token, newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' },
          },
        },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.applyPasswordReset).toMatchObject({ code: 200, success: true });

    const record = await PasswordResetToken.findOne({ tokenHash: hashPasswordResetToken(token) });
    expect(record?.usedAt).not.toBeNull();
  });

  it('returns BAD_USER_INPUT when passwords do not match', async () => {
    const user = await createTestUser();
    const token = await seedToken(user.id);

    const { errors } = singleResult(
      await server.executeOperation(
        {
          query: APPLY_RESET,
          variables: {
            input: { token, newPassword: 'NewPassword123!', confirmPassword: 'Different123!' },
          },
        },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('returns BAD_USER_INPUT for a short new password', async () => {
    const user = await createTestUser();
    const token = await seedToken(user.id);

    const { errors } = singleResult(
      await server.executeOperation(
        {
          query: APPLY_RESET,
          variables: { input: { token, newPassword: 'short', confirmPassword: 'short' } },
        },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });
});
