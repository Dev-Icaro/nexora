import type { ApolloServerPlugin } from '@apollo/server';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

import settings from '@/config/settings';
import { TooManyRequestsException } from '@/exceptions';

import type { GraphQLContext } from '../context';

const emailRateLimiter = new RateLimiterMemory({
  points: settings.EMAIL_RATE_LIMIT_MAX_REQUESTS,
  duration: settings.EMAIL_RATE_LIMIT_WINDOW_MS / 1000,
});
const authRateLimiter = new RateLimiterMemory({
  points: settings.AUTH_RATE_LIMIT_MAX_REQUESTS,
  duration: settings.AUTH_RATE_LIMIT_WINDOW_MS / 1000,
});
const generalRateLimiter = new RateLimiterMemory({
  points: settings.GENERAL_RATE_LIMIT_MAX_REQUESTS,
  duration: settings.GENERAL_RATE_LIMIT_WINDOW_MS / 1000,
});
const guestRateLimiter = new RateLimiterMemory({
  points: settings.GUEST_RATE_LIMIT_MAX_REQUESTS,
  duration: settings.GUEST_RATE_LIMIT_WINDOW_MS / 1000,
});

const EMAIL_OPERATIONS = new Set(['RequestPasswordReset']);
const AUTH_OPERATIONS = new Set(['Login', 'Register', 'Refresh', 'Logout']);

/**
 * Apollo Server plugin that enforces graduated rate limiting before resolver execution.
 *
 * @remarks
 * Priority order (most specific first):
 * 1. emailRateLimiter  — email-sending operations (5 req / 15 min, keyed by ip:operation)
 * 2. authRateLimiter   — auth mutations (20 req / 60 s, keyed by IP)
 * 3. generalRateLimiter — authenticated operations (200 req / 60 s, keyed by userId)
 * 4. guestRateLimiter  — all other unauthenticated operations (60 req / 60 s, keyed by IP)
 */
export const rateLimiterPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart() {
    return {
      async didResolveOperation({ contextValue, operationName }) {
        const { req, currentUser } = contextValue;
        const ip =
          req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ??
          req.socket.remoteAddress ??
          req.ip ??
          'unknown';

        const name = operationName ?? '';

        try {
          if (EMAIL_OPERATIONS.has(name)) {
            await emailRateLimiter.consume(`${ip}:${name}`);
          } else if (AUTH_OPERATIONS.has(name)) {
            await authRateLimiter.consume(ip);
          } else if (currentUser) {
            await generalRateLimiter.consume(currentUser.userId);
          } else {
            await guestRateLimiter.consume(ip);
          }
        } catch (error) {
          if (error instanceof RateLimiterRes) {
            throw new TooManyRequestsException();
          }
          throw error;
        }
      },
    };
  },
};
