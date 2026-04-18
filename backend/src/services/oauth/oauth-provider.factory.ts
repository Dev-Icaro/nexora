import { BadRequestException } from '@/exceptions';

import { GithubOAuthProvider } from './github-oauth.provider';
import { GoogleOAuthProvider } from './google-oauth.provider';
import type { IOAuthProvider } from './oauth-provider.interface';

export class OAuthProviderFactory {
  static getProvider(providerName: string): IOAuthProvider {
    switch (providerName) {
      case 'github':
        return new GithubOAuthProvider();
      case 'google':
        return new GoogleOAuthProvider();
      default:
        throw new BadRequestException(`Unsupported OAuth provider: ${providerName}`);
    }
  }
}
