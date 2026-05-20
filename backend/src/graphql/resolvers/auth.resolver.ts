import env from '@/config/environment';
import settings from '@/config/settings';
import { UnauthorizedException } from '@/exceptions';
import type { Resolvers } from '@/graphql/__generated__/types';

export const authResolver: Resolvers = {
  Query: {
    validatePasswordResetToken: (_, { token }, { dataSources }) =>
      dataSources.authService.validatePasswordResetToken(token),
  },
  Mutation: {
    register: (_, { registerRequest }, { dataSources }) => dataSources.authService.register(registerRequest),

    login: async (_, { loginRequest }, { dataSources, res }) => {
      const { refreshToken, ...response } = await dataSources.authService.login(loginRequest);
      res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: settings.REFRESH_TOKEN_COOKIE_SAME_SITE,
        maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
      });
      return response;
    },

    refresh: async (_, __, { dataSources, req, res }) => {
      const token = req.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
      if (!token) throw new UnauthorizedException('Unauthorized');

      const { refreshToken, ...response } = await dataSources.authService.refresh(token);
      res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: settings.REFRESH_TOKEN_COOKIE_SAME_SITE,
        maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
      });
      return response;
    },

    logout: async (_, __, { dataSources, req, res }) => {
      const token = req.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
      const response = token
        ? await dataSources.authService.logout(token)
        : { code: 200, success: true, message: 'Logged out successfully' };
      res.clearCookie(settings.REFRESH_TOKEN_COOKIE_NAME);
      return response;
    },

    requestPasswordReset: (_, { requestPasswordResetRequest }, { dataSources }) =>
      dataSources.authService.requestPasswordReset(requestPasswordResetRequest.email),

    applyPasswordReset: async (_, { applyPasswordResetRequest }, { dataSources, res }) => {
      const response = await dataSources.authService.applyPasswordReset(applyPasswordResetRequest);
      res.clearCookie(settings.REFRESH_TOKEN_COOKIE_NAME);
      return response;
    },
  },
};
