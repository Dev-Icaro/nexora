import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Router } from 'express';

import env from '@/config/environment';
import settings from '@/config/settings';
import { AppException } from '@/exceptions';
import { AuthService } from '@/services/auth.service';
import { OAuthProviderFactory } from '@/services/oauth/oauth-provider.factory';
import { UserService } from '@/services/user.service';

export const authRouter = Router();
const authService = new AuthService(new UserService());

function getCallbackUrl(provider: string): string {
  return `${env.BACKEND_URL}/auth/${provider}/callback`;
}

authRouter.get('/:provider', (req: ExpressRequest<{ provider: string }>, res: ExpressResponse) => {
  const { provider } = req.params;
  const oauthProvider = OAuthProviderFactory.getProvider(provider);
  const callbackUrl = getCallbackUrl(provider);
  res.redirect(oauthProvider.generateAuthorizationUrl(callbackUrl));
});

authRouter.get('/:provider/callback', async (req: ExpressRequest<{ provider: string }>, res: ExpressResponse) => {
  const { provider } = req.params;
  const { code } = req.query;

  if (typeof code !== 'string' || !code) {
    throw new AppException('Missing authorization code', 400);
  }

  const oauthProvider = OAuthProviderFactory.getProvider(provider);
  const callbackUrl = getCallbackUrl(provider);

  const accessToken = await oauthProvider.generateAccessToken(code, callbackUrl);
  const oauthUser = await oauthProvider.getUser(accessToken);

  const { refreshToken } = await authService.loginWithOAuth(provider, oauthUser);

  res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: settings.REFRESH_TOKEN_COOKIE_SAME_SITE,
    maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
  });

  res.redirect(env.FRONTEND_URL);
});
