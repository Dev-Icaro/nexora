import env from '@/config/environment';
import settings from '@/config/settings';
import type LoginRequest from '@/dtos/login-request.dto';
import type RegisterRequest from '@/dtos/register-request.dto';
import { UnauthorizedException } from '@/exceptions';

import type { GraphQLContext } from '../context';

export const authMutations = {
  register: async (
    _: unknown,
    { registerRequest }: { registerRequest: RegisterRequest },
    { dataSources }: GraphQLContext,
  ) => dataSources.authService.register(registerRequest),

  login: async (_: unknown, { loginRequest }: { loginRequest: LoginRequest }, { dataSources, res }: GraphQLContext) => {
    const { refreshToken, ...response } = await dataSources.authService.login(loginRequest);

    res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
    });

    return response;
  },

  refresh: async (_: unknown, __: unknown, { dataSources, req, res }: GraphQLContext) => {
    const token = req.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
    if (!token) throw new UnauthorizedException('Unauthorized');

    const { refreshToken, ...response } = await dataSources.authService.refresh(token);

    res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
    });

    return response;
  },

  logout: async (_: unknown, __: unknown, { dataSources, req, res }: GraphQLContext) => {
    const token = req.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

    const response = token
      ? await dataSources.authService.logout(token)
      : { code: 200, success: true, message: 'Logged out successfully' };

    res.clearCookie(settings.REFRESH_TOKEN_COOKIE_NAME);

    return response;
  },
};
