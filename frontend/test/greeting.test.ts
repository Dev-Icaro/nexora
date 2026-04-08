import { describe, expect, it } from 'vitest';

function greet(name: string): string {
  return `Hello, ${name}!`;
}

describe('greeting', () => {
  it('returns a greeting message', () => {
    expect(greet('Nexora')).toBe('Hello, Nexora!');
  });
});
