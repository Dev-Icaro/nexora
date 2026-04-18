import env from '@/config/environment';
import { AppException } from '@/exceptions';

import type { IOAuthProvider, OAuthUserInfo } from './oauth-provider.interface';

export class GoogleOAuthProvider implements IOAuthProvider {
  private readonly clientId = env.GOOGLE_CLIENT_ID;
  private readonly clientSecret = env.GOOGLE_CLIENT_SECRET;

  generateAuthorizationUrl(callbackUrl: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async generateAccessToken(code: string, callbackUrl: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const data = (await response.json()) as { access_token?: string; error?: string };
    if (!data.access_token) {
      throw new AppException(`Google token exchange failed: ${data.error ?? 'unknown error'}`, 502);
    }
    return data.access_token;
  }

  async getUser(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = (await response.json()) as {
      sub: string;
      email: string;
      email_verified: boolean;
      name: string;
    };

    if (!user.email_verified) {
      throw new AppException('Google account email is not verified', 400);
    }

    return {
      providerId: user.sub,
      email: user.email,
      name: user.name,
    };
  }
}
