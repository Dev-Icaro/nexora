import type CreateUserDto from '@/dtos/create-user.dto';
import type UserDto from '@/dtos/user.dto';

/** Defines the contract for user data access and refresh-token hash lifecycle management. */
export interface IUserService {
  /**
   * Finds a user by their email address.
   *
   * @param email - The email address to search for.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found.
   */
  findByEmail(email: string): Promise<UserDto | null>;

  /**
   * Persists a hashed refresh token for a user with an expiry date.
   *
   * @param userId - The unique identifier of the user.
   * @param hash - The SHA-512 HMAC hash of the refresh token (see `createHashForRefreshToken`).
   * @param expiresAt - The UTC date/time at which the token hash expires.
   * @returns A promise that resolves when the operation completes.
   */
  saveRefreshTokenHash(userId: string, hash: string, expiresAt: Date): Promise<void>;

  /**
   * Finds a user by a stored refresh token hash.
   *
   * @param hash - The SHA-512 HMAC hash of the refresh token to look up.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found or expired.
   */
  findByRefreshTokenHash(hash: string): Promise<UserDto | null>;

  /**
   * Removes a specific refresh token hash from a user's stored tokens.
   *
   * @param userId - The unique identifier of the user.
   * @param hash - The SHA-512 HMAC hash of the refresh token to remove.
   * @returns A promise that resolves when the token hash has been removed.
   */
  removeRefreshTokenHash(userId: string, hash: string): Promise<void>;

  /**
   * Finds a user who has a linked OAuth account matching the given provider and provider-specific ID.
   *
   * @param provider - The OAuth provider name (e.g. `'github'`, `'google'`).
   * @param providerId - The provider's stable unique identifier for the user.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found.
   */
  findByOAuthAccount(provider: string, providerId: string): Promise<UserDto | null>;

  /**
   * Creates a new user account from the given data.
   * Supports both credential-based accounts (with `password`) and OAuth-only accounts
   * (with `provider` and `providerId`, without a password).
   *
   * @param data - The new user's details. See {@link CreateUserDto}.
   * @returns A promise resolving to the newly created {@link UserDto}.
   */
  create(data: CreateUserDto): Promise<UserDto>;

  /**
   * Links an OAuth account to an existing user, enabling future logins via that provider.
   * Uses an idempotent `$addToSet` operation — safe to call multiple times with the same arguments.
   *
   * @param userId - The unique identifier of the user to link the OAuth account to.
   * @param provider - The OAuth provider name (e.g. `'github'`, `'google'`).
   * @param providerId - The provider's stable unique identifier for the user.
   * @returns A promise that resolves when the link has been persisted.
   */
  linkOAuthAccount(userId: string, provider: string, providerId: string): Promise<void>;
}
