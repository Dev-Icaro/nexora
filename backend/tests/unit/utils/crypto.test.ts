import { describe, expect, it } from 'vitest';

import { comparePassword, generatePasswordResetToken, hashPassword, hashPasswordResetToken } from '@/utils/crypto';

describe('hashPassword / comparePassword', () => {
  it('accepts the correct plain-text password', async () => {
    const hash = await hashPassword('MySecret123!');
    expect(await comparePassword('MySecret123!', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('MySecret123!');
    expect(await comparePassword('Wrong!', hash)).toBe(false);
  });

  it('each call produces a unique hash (bcrypt salting)', async () => {
    const [a, b] = await Promise.all([hashPassword('same'), hashPassword('same')]);
    expect(a).not.toBe(b);
  });

  it('handles passwords longer than 72 bytes without silent truncation', async () => {
    const long = 'a'.repeat(100);
    const hash = await hashPassword(long);
    expect(await comparePassword(long, hash)).toBe(true);
    // A password that differs only beyond byte 72 must NOT match
    expect(await comparePassword('a'.repeat(99) + 'b', hash)).toBe(false);
  });
});

describe('generatePasswordResetToken', () => {
  it('returns a 64-character lowercase hex string', () => {
    const token = generatePasswordResetToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  it('generates unique tokens on every call', () => {
    expect(generatePasswordResetToken()).not.toBe(generatePasswordResetToken());
  });
});

describe('hashPasswordResetToken', () => {
  it('is deterministic', () => {
    const t = generatePasswordResetToken();
    expect(hashPasswordResetToken(t)).toBe(hashPasswordResetToken(t));
  });

  it('different tokens produce different hashes', () => {
    expect(hashPasswordResetToken('abc')).not.toBe(hashPasswordResetToken('xyz'));
  });
});
