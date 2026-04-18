import env from '@/config/environment';
import { AppException } from '@/exceptions';

import type { IOAuthProvider, OAuthUserInfo } from './oauth-provider.interface';

export class GithubOAuthProvider implements IOAuthProvider {
  private readonly clientId = env.GITHUB_CLIENT_ID;
  private readonly clientSecret = env.GITHUB_CLIENT_SECRET;

  generateAuthorizationUrl(callbackUrl: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: callbackUrl,
      scope: 'user:email read:user',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async generateAccessToken(code: string, callbackUrl: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: callbackUrl,
      }),
    });

    const data = (await response.json()) as { access_token?: string; error?: string };
    if (!data.access_token) {
      throw new AppException(`GitHub token exchange failed: ${data.error ?? 'unknown error'}`, 502);
    }
    return data.access_token;
  }

  async getUser(accessToken: string): Promise<OAuthUserInfo> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const userResponse = await fetch('https://api.github.com/user', { headers });
    const user = (await userResponse.json()) as {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
    };

    let email = user.email;

    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', { headers });
      const emails = (await emailsResponse.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find(e => e.primary && e.verified);
      if (!primary) {
        throw new AppException('Unable to retrieve verified email from GitHub account', 400);
      }
      email = primary.email;
    }

    return {
      providerId: String(user.id),
      email,
      name: user.name ?? user.login,
    };
  }
}
