import { describe, expect, it } from 'vitest';

import { getPasswordStrength } from '@/features/auth/utils/password-strength';

describe('getPasswordStrength', () => {
  it('returns weak for very short password', () => {
    const result = getPasswordStrength('a');
    expect(result.level).toBe('weak');
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('returns weak for empty string', () => {
    const result = getPasswordStrength('');
    expect(result.level).toBe('weak');
    expect(result.score).toBe(0);
  });

  it('returns fair when 2 criteria met', () => {
    const result = getPasswordStrength('abcdefgh');
    expect(result.level).toBe('fair');
    expect(result.score).toBe(2);
  });

  it('returns good when 3–4 criteria met', () => {
    const result = getPasswordStrength('Abcdefgh');
    expect(result.level).toBe('good');
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  it('returns strong when all 5 criteria met', () => {
    const result = getPasswordStrength('Abcdefg1!');
    expect(result.level).toBe('strong');
    expect(result.score).toBe(5);
  });

  it('each result includes a non-empty label', () => {
    const passwords = ['x', 'abcdefgh', 'Abcdefgh', 'Abcdefg1!'];
    for (const p of passwords) {
      expect(getPasswordStrength(p).label.length).toBeGreaterThan(0);
    }
  });
});
