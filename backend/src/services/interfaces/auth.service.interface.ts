import type { ApplyPasswordResetDto, LoginDto, RegisterDto, TokenInfoDto } from '@/dtos/auth';
import type { OAuthUserInfo } from '@/services/oauth/oauth-provider.interface';

/** Defines the contract for authentication operations: registration, login, and token refresh. */
export interface IAuthService {
  /**
   * Registers a new user account.
   *
   * Creates the user with `emailVerified: false`, stores a hashed verification token, and sends
   * a verification email. If the email already exists as unverified, replaces the token and
   * resends the email. Throws {@link ConflictException} when the email is already verified.
   *
   * @param credentials - Registration payload containing username, email, password, and confirmPassword.
   * @returns A promise resolving to `true` on success.
   */
  register(credentials: RegisterDto): Promise<boolean>;

  /**
   * Authenticates a user with email and password credentials.
   *
   * @param credentials - Login payload containing email and password.
   * @returns A promise resolving to a {@link TokenInfoDto} with the authenticated user and issued tokens.
   */
  login(credentials: LoginDto): Promise<TokenInfoDto>;

  /**
   * Issues a new access token and rotates the refresh token.
   *
   * @param refreshToken - The current refresh token from login or a previous refresh.
   * @returns A promise resolving to a {@link TokenInfoDto} with the refreshed user and new tokens.
   */
  refresh(refreshToken: string): Promise<TokenInfoDto>;

  /**
   * Invalidates a refresh token by removing its hash from the database.
   *
   * @param refreshToken - The current refresh token to invalidate.
   */
  logout(refreshToken: string): Promise<void>;

  /**
   * Initiates a password reset flow for the given email address.
   *
   * Generates a time-limited token, stores its hash, and sends a reset email when
   * the email is registered. Returns silently when email is not registered to avoid
   * leaking whether the address exists.
   *
   * @param email - The email address of the account to reset.
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Applies a password reset by validating the token and updating the user's password.
   *
   * Re-validates the token before making any changes, hashes the new password, marks
   * the token as consumed, and clears all active sessions (global logout).
   *
   * @param dto - Payload containing token, newPassword, and confirmPassword.
   */
  applyPasswordReset(dto: ApplyPasswordResetDto): Promise<void>;

  /**
   * Validates a password reset token without consuming it.
   *
   * Checks token existence, expiration, and prior use. Throws an exception for any
   * invalid state so the resolver returns a GraphQL error to the client.
   *
   * @param token - The raw reset token from the URL query parameter.
   */
  validatePasswordResetToken(token: string): Promise<void>;

  /**
   * Resends the email verification link for an unverified account.
   *
   * Returns `true` silently when the email is unknown or already verified to prevent
   * email enumeration. For a valid unverified account, invalidates any existing token,
   * generates a new one, and sends a fresh verification email.
   *
   * @param email - The email address that should receive a fresh verification link.
   * @returns A promise resolving when the operation completes.
   */
  resendVerificationEmail(email: string): Promise<void>;

  /**
   * Verifies an email address using the token from the verification link.
   *
   * Hashes the raw token, looks up the corresponding record, rejects expired or unknown tokens,
   * marks the account as verified, deletes the token document, and creates a new session.
   *
   * @param token - The raw verification token from the URL query parameter.
   * @returns A promise resolving to a {@link TokenInfoDto} so the user is automatically logged in.
   */
  verifyEmail(token: string): Promise<TokenInfoDto>;

  /**
   * Authenticates or provisions a user via an OAuth provider.
   *
   * Looks up the user by their OAuth account first; if not found, falls back to email matching
   * (linking the provider to an existing account) or creates a new account if no match exists.
   *
   * @param provider - The OAuth provider name (e.g. `'github'`, `'google'`).
   * @param oauthUser - The normalized user profile returned by the provider.
   * @returns A promise resolving to the issued `refreshToken`.
   */
  loginWithOAuth(provider: string, oauthUser: OAuthUserInfo): Promise<Pick<TokenInfoDto, 'refreshToken'>>;
}
