import { createHash } from 'node:crypto';

import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

/**
 * Pre-hashes the password with SHA-256, producing a fixed 64-char hex string.
 * This prevents bcrypt's silent 72-byte truncation on long passwords.
 */
function preHash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(preHash(password), BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(preHash(plain), hashed);
}
