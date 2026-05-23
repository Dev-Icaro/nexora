import { describe, expect, it } from 'vitest';

import { createAccessToken, createHashForRefreshToken, createRefreshToken, verifyAccessToken } from '@/utils/auth';

describe('createAccessToken / verifyAccessToken', () => {
  it('returns a signed JWT with three segments', () => {
    const token = createAccessToken({ userId: 'user-1' });
    expect(token.split('.')).toHaveLength(3);
  });

  it('decoded payload contains the original userId', () => {
    const token = createAccessToken({ userId: 'user-42' });
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('user-42');
  });

  it('throws on a tampered signature', () => {
    const token = createAccessToken({ userId: 'user-1' });
    const tampered = token.slice(0, -4) + 'XXXX';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('throws when a refresh token is used as an access token (wrong audience)', () => {
    const refresh = createRefreshToken({ userId: 'user-1' });
    expect(() => verifyAccessToken(refresh)).toThrow();
  });
});

describe('createHashForRefreshToken', () => {
  it('is deterministic for the same input', () => {
    const hash1 = createHashForRefreshToken('some-token');
    const hash2 = createHashForRefreshToken('some-token');
    expect(hash1).toBe(hash2);
  });

  it('produces a lowercase hex string', () => {
    expect(createHashForRefreshToken('abc')).toMatch(/^[a-f0-9]+$/);
  });

  it('different tokens produce different hashes', () => {
    const a = createHashForRefreshToken('token-a');
    const b = createHashForRefreshToken('token-b');
    expect(a).not.toBe(b);
  });
});
