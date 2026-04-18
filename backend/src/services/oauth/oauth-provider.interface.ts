/** Normalized user profile returned by any OAuth provider after a successful authorization. */
export interface OAuthUserInfo {
  /** The provider's stable unique identifier for this user (e.g. GitHub user ID, Google `sub`). */
  providerId: string;
  /** The user's verified primary email address obtained from the provider. */
  email: string;
  /** The user's display name as returned by the provider (used to generate an initial username). */
  name: string;
}

/** Defines the contract for a third-party OAuth 2.0 provider integration. */
export interface IOAuthProvider {
  /**
   * Builds the authorization URL to redirect the browser to the OAuth provider's login page.
   *
   * @param callbackUrl - The backend redirect URI registered with the OAuth provider.
   * @returns The fully-formed authorization URL including all required query parameters.
   */
  generateAuthorizationUrl(callbackUrl: string): string;

  /**
   * Exchanges a one-time authorization code for a provider access token.
   *
   * @param code - The authorization code received in the OAuth callback query string.
   * @param callbackUrl - Must exactly match the `redirect_uri` used in {@link generateAuthorizationUrl}.
   * @returns A promise resolving to the provider access token.
   * @throws {@link AppException} with status 502 if the token exchange request fails.
   */
  generateAccessToken(code: string, callbackUrl: string): Promise<string>;

  /**
   * Fetches the authenticated user's normalized profile from the provider.
   *
   * @param accessToken - The provider access token obtained via {@link generateAccessToken}.
   * @returns A promise resolving to a {@link OAuthUserInfo} with the user's stable ID, email, and name.
   * @throws {@link AppException} with status 400 if a verified email cannot be retrieved.
   */
  getUser(accessToken: string): Promise<OAuthUserInfo>;
}
