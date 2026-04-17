import { createHash } from 'node:crypto';

import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

/**
 * Pre-hashes a password with SHA-256, producing a fixed 64-character hex string.
 *
 * @remarks
 * Prevents bcrypt's silent 72-byte truncation on long passwords.
 *
 * @param password - The plain-text password to pre-hash.
 * @returns A 64-character lowercase hex string (SHA-256 digest).
 *
 * @internal
 */
function preHash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Hashes a plain-text password using SHA-256 pre-hashing followed by bcrypt.
 *
 * @param password - The plain-text password to hash.
 * @returns A promise resolving to the bcrypt hash string suitable for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(preHash(password), BCRYPT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 *
 * @param plain - The plain-text password supplied by the user.
 * @param hashed - The bcrypt hash previously produced by {@link hashPassword}.
 * @returns A promise resolving to `true` if the password matches, `false` otherwise.
 */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(preHash(plain), hashed);
}
