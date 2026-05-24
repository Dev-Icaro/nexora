import { describe, expect, it } from 'vitest';

import { formatBytes, formatCompactNumber, getApiErrorMessage, getInitials } from '@/shared/lib/utils';

describe('formatBytes', () => {
  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats megabytes with one decimal when needed', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('formatCompactNumber', () => {
  it('leaves small numbers unchanged', () => {
    expect(formatCompactNumber(42)).toBe('42');
  });

  it('abbreviates thousands', () => {
    expect(formatCompactNumber(1000)).toBe('1K');
  });

  it('abbreviates with one decimal for non-round values', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('abbreviates millions', () => {
    expect(formatCompactNumber(1_000_000)).toBe('1M');
  });
});

describe('getInitials', () => {
  it('returns first two words initial letters uppercased', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns single initial for single word', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('ignores words beyond the second', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('uppercases lowercase initials', () => {
    expect(getInitials('alice bob')).toBe('AB');
  });
});

describe('getApiErrorMessage', () => {
  it('returns undefined when no error and no data', () => {
    expect(getApiErrorMessage(undefined, undefined)).toBeUndefined();
  });

  it('returns network error message when only error is present', () => {
    const error = { message: 'Network error', name: 'ApolloError' } as const;
    expect(getApiErrorMessage(error, undefined)).toBe('Network error');
  });

  it('returns API message when success is false', () => {
    const data = { login: { code: 401, message: 'Invalid credentials', success: false } };
    expect(getApiErrorMessage(undefined, data)).toBe('Invalid credentials');
  });

  it('returns undefined when success is true', () => {
    const data = { login: { code: 200, message: 'OK', success: true } };
    expect(getApiErrorMessage(undefined, data)).toBeUndefined();
  });

  it('falls back to network error message when API message is missing', () => {
    const error = { message: 'Network error', name: 'ApolloError' } as const;
    const data = { login: { code: 500, message: undefined as unknown as string, success: false } };
    expect(getApiErrorMessage(error, data)).toBe('Network error');
  });
});
