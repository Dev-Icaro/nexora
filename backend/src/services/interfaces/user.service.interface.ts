import type { CreateUserDto } from '@/dtos/auth';
import type { UploadUrlDto } from '@/dtos/shared';
import type { GetAvatarUploadUrlDto, UpdateProfileDto, UpdateThemePreferenceDto, UserDto } from '@/dtos/user';

/** Defines the contract for user data access and refresh-token hash lifecycle management. */
export interface IUserService {
  /**
   * Finds a user by their unique identifier.
   *
   * @param userId - The MongoDB ObjectId string of the user.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found.
   */
  getById(userId: string): Promise<UserDto | null>;

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address to search for.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found.
   */
  getByEmail(email: string): Promise<UserDto | null>;

  /**
   * Persists a hashed refresh token for a user with an expiry date.
   *
   * @param userId - The unique identifier of the user.
   * @param hash - The SHA-512 HMAC hash of the refresh token (see `createHashForRefreshToken`).
   * @param expiresAt - The UTC date/time at which the token hash expires.
   */
  saveRefreshTokenHash(userId: string, hash: string, expiresAt: Date): Promise<void>;

  /**
   * Finds a user by a stored refresh token hash.
   *
   * @param hash - The SHA-512 HMAC hash of the refresh token to look up.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found or expired.
   */
  getByRefreshTokenHash(hash: string): Promise<UserDto | null>;

  /**
   * Removes a specific refresh token hash from a user's stored tokens.
   *
   * @param userId - The unique identifier of the user.
   * @param hash - The SHA-512 HMAC hash of the refresh token to remove.
   */
  removeRefreshTokenHash(userId: string, hash: string): Promise<void>;

  /**
   * Finds a user who has a linked OAuth account matching the given provider and provider-specific ID.
   *
   * @param provider - The OAuth provider name (e.g. `'github'`, `'google'`).
   * @param providerId - The provider's stable unique identifier for the user.
   * @returns A promise resolving to the matching {@link UserDto}, or `null` if not found.
   */
  getByOAuthAccount(provider: string, providerId: string): Promise<UserDto | null>;

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
   * Removes all stored refresh token hashes for a user, forcing a global logout.
   *
   * @param userId - The unique identifier of the user.
   */
  clearAllRefreshTokens(userId: string): Promise<void>;

  /**
   * Links an OAuth account to an existing user, enabling future logins via that provider.
   * Uses an idempotent `$addToSet` operation — safe to call multiple times with the same arguments.
   *
   * @param userId - The unique identifier of the user to link the OAuth account to.
   * @param provider - The OAuth provider name (e.g. `'github'`, `'google'`).
   * @param providerId - The provider's stable unique identifier for the user.
   */
  linkOAuthAccount(userId: string, provider: string, providerId: string): Promise<void>;

  /**
   * Updates the profile fields (bio, position) of the authenticated user.
   * When `objectKey` is present, also validates, moves, and confirms the pending avatar upload.
   *
   * @param dto - Profile fields to update, optional avatar object key, and the user's ID.
   * @returns A promise resolving to the updated {@link UserDto}.
   */
  updateProfile(dto: UpdateProfileDto): Promise<UserDto>;

  /**
   * Persists the user's theme preference (`light`, `dark`, or `system`).
   *
   * @param dto - The theme preference to store and the user's ID.
   * @returns A promise resolving to the updated {@link UserDto}.
   */
  updateThemePreference(dto: UpdateThemePreferenceDto): Promise<UserDto>;

  /**
   * Generates a presigned S3 POST URL for uploading a user avatar (images only: jpeg, png, webp).
   *
   * @param dto - Upload parameters including userId, filename, contentType, and declared file size.
   * @returns A promise resolving to an {@link UploadUrlDto} with the presigned URL, form fields, and object key.
   */
  getAvatarUploadUrl(dto: GetAvatarUploadUrlDto): Promise<UploadUrlDto>;
}
