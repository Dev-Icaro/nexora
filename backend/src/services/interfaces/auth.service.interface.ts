import type ApplyPasswordResetRequest from '@/dtos/apply-password-reset-request.dto';
import type ApplyPasswordResetResponse from '@/dtos/apply-password-reset-response.dto';
import type LoginRequest from '@/dtos/login-request.dto';
import type LoginResponse from '@/dtos/login-response.dto';
import type LogoutResponse from '@/dtos/logout-response.dto';
import type RefreshResponse from '@/dtos/refresh-response.dto';
import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';
import type RequestPasswordResetResponse from '@/dtos/request-password-reset-response.dto';
import type ValidatePasswordResetTokenResponse from '@/dtos/validate-password-reset-token-response.dto';
import type { OAuthUserInfo } from '@/services/oauth/oauth-provider.interface';

/** Defines the contract for authentication operations: registration, login, and token refresh. */
export interface IAuthService {
  /**
   * Registers a new user account.
   *
   * @param request - Registration payload containing username, email, password, and confirmPassword.
   * @returns A promise resolving to a {@link RegisterResponse} with the created user data.
   */
  register(request: RegisterRequest): Promise<RegisterResponse>;

  /**
   * Authenticates a user with email and password credentials.
   *
   * @param request - Login payload containing email and password.
   * @returns A promise resolving to a {@link LoginResponse} extended with a `refreshToken` string.
   */
  login(request: LoginRequest): Promise<LoginResponse & { refreshToken: string }>;

  /**
   * Issues a new access token and rotates the refresh token.
   *
   * @param refreshToken - The current refresh token from login or a previous refresh.
   * @returns A promise resolving to a {@link RefreshResponse} extended with the new `refreshToken`.
   */
  refresh(refreshToken: string): Promise<RefreshResponse & { refreshToken: string }>;

  /**
   * Invalidates a refresh token by removing its hash from the database.
   *
   * @param refreshToken - The current refresh token to invalidate.
   * @returns A promise resolving to a {@link LogoutResponse}.
   */
  logout(refreshToken: string): Promise<LogoutResponse>;

  /**
   * Initiates a password reset flow for the given email address.
   *
   * Generates a time-limited token, stores its hash, and sends a reset email when
   * the email is registered. Always returns a generic success response to avoid
   * leaking whether the email exists.
   *
   * @param email - The email address of the account to reset.
   * @returns A promise resolving to a {@link RequestPasswordResetResponse}.
   */
  requestPasswordReset(email: string): Promise<RequestPasswordResetResponse>;

  /**
   * Applies a password reset by validating the token and updating the user's password.
   *
   * Re-validates the token before making any changes, hashes the new password, marks
   * the token as consumed, and clears all active sessions (global logout).
   *
   * @param request - Payload containing token, newPassword, and confirmPassword.
   * @returns A promise resolving to an {@link ApplyPasswordResetResponse}.
   */
  applyPasswordReset(request: ApplyPasswordResetRequest): Promise<ApplyPasswordResetResponse>;

  /**
   * Validates a password reset token without consuming it.
   *
   * Checks token existence, expiration, and prior use. Throws an exception for any
   * invalid state so the resolver returns a GraphQL error to the client.
   *
   * @param token - The raw reset token from the URL query parameter.
   * @returns A promise resolving to a {@link ValidatePasswordResetTokenResponse} when the token is valid.
   */
  validatePasswordResetToken(token: string): Promise<ValidatePasswordResetTokenResponse>;

  /**
   * Authenticates or provisions a user via an OAuth provider.
   *
   * Looks up the user by their OAuth account first; if not found, falls back to email matching
   * (linking the provider to an existing account) or creates a new account if no match exists.
   *
   * @param provider - The OAuth provider name (e.g. `'github'`, `'google'`).
   * @param oauthUser - The normalized user profile returned by the provider.
   * @returns A promise resolving to an object containing the issued `refreshToken`.
   */
  loginWithOAuth(provider: string, oauthUser: OAuthUserInfo): Promise<{ refreshToken: string }>;
}
