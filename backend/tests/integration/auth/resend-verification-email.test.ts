import { beforeEach, describe, expect, it } from 'vitest';

import { EmailVerificationToken } from '@/models/email-verification-token.model';
import { generateEmailVerificationToken, hashEmailVerificationToken } from '@/utils/crypto';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createMockEmailService } from '../../setup/mocks/email.mock';
import { createTestServer, singleResult } from '../../setup/server';

const RESEND_VERIFICATION_EMAIL = `
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;

describe('resendVerificationEmail', () => {
  const emailService = createMockEmailService();
  const { server, buildContext } = createTestServer({ emailService });

  beforeEach(async () => {
    await clearDb();
    emailService.sendEmail.mockClear();
  });

  it('returns true and sends no email for an unknown address', async () => {
    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: RESEND_VERIFICATION_EMAIL, variables: { email: 'nobody@nexora.test' } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.resendVerificationEmail).toBe(true);
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('returns true and sends no email for an already-verified account', async () => {
    const user = await createTestUser({ email: 'verified@nexora.test', emailVerified: true });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: RESEND_VERIFICATION_EMAIL, variables: { email: user.email } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.resendVerificationEmail).toBe(true);
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('sends exactly one email and invalidates the prior token for a valid unverified account', async () => {
    const user = await createTestUser({ email: 'unverified@nexora.test', emailVerified: false });
    const oldTokenHash = hashEmailVerificationToken(generateEmailVerificationToken());
    await EmailVerificationToken.create({
      userId: user.id,
      tokenHash: oldTokenHash,
      expiresAt: new Date(Date.now() + 3_600_000),
    });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: RESEND_VERIFICATION_EMAIL, variables: { email: user.email } },
        { contextValue: buildContext() },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.resendVerificationEmail).toBe(true);
    expect(emailService.sendEmail).toHaveBeenCalledOnce();
    expect(emailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: user.email }));

    const tokens = await EmailVerificationToken.find({ userId: user.id });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].tokenHash).not.toBe(oldTokenHash);
  });
});
