import type LoginRequest from '@/dtos/login-request.dto';
import type LoginResponse from '@/dtos/login-response.dto';
import type LogoutResponse from '@/dtos/logout-response.dto';
import type RefreshResponse from '@/dtos/refresh-response.dto';
import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';

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
}
