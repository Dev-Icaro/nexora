import env from '@/config/environment';
import settings from '@/config/settings';
import { UnauthorizedException } from '@/exceptions';
import type { Resolvers } from '@/graphql/__generated__/types';

export const authResolver: Resolvers = {
  Query: {
    validatePasswordResetToken: async (_, { token }, { dataSources }) => {
      await dataSources.authService.validatePasswordResetToken(token);
      return { code: 200, success: true, message: 'Token is valid' };
    },
  },
  Mutation: {
    register: async (_, { registerRequest }, { dataSources }) => {
      return dataSources.authService.register(registerRequest);
    },

    login: async (_, { loginRequest }, { dataSources, res }) => {
      const { user, accessToken, refreshToken } = await dataSources.authService.login(loginRequest);
      res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: settings.REFRESH_TOKEN_COOKIE_SAME_SITE,
        maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
      });
      return { code: 200, success: true, message: 'Login successful', accessToken, user };
    },

    refresh: async (_, __, { dataSources, req, res }) => {
      const token = req.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
      if (!token) throw new UnauthorizedException('Unauthorized');

      const { user, accessToken, refreshToken } = await dataSources.authService.refresh(token);
      res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: settings.REFRESH_TOKEN_COOKIE_SAME_SITE,
        maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
      });
      return { code: 200, success: true, message: 'Token refreshed', accessToken, user };
    },

    logout: async (_, __, { dataSources, req, res }) => {
      const token = req.cookies[settings.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
      if (token) await dataSources.authService.logout(token);
      res.clearCookie(settings.REFRESH_TOKEN_COOKIE_NAME);
      return { code: 200, success: true, message: 'Logged out successfully' };
    },

    requestPasswordReset: async (_, { requestPasswordResetRequest }, { dataSources }) => {
      await dataSources.authService.requestPasswordReset(requestPasswordResetRequest.email);
      return { code: 200, success: true, message: 'If this email is registered, you will receive a reset link.' };
    },

    applyPasswordReset: async (_, { applyPasswordResetRequest }, { dataSources, res }) => {
      await dataSources.authService.applyPasswordReset(applyPasswordResetRequest);
      res.clearCookie(settings.REFRESH_TOKEN_COOKIE_NAME);
      return { code: 200, success: true, message: 'Password reset successfully' };
    },

    verifyEmail: async (_, { token }, { dataSources, res }) => {
      const { user, accessToken, refreshToken } = await dataSources.authService.verifyEmail(token);
      res.cookie(settings.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: settings.REFRESH_TOKEN_COOKIE_SAME_SITE,
        maxAge: settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000,
      });
      return { code: 200, success: true, message: 'Email verified successfully', accessToken, user };
    },
  },
};
