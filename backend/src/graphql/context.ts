import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { GraphQLError } from 'graphql/error';

import { AuthService } from '@/services/auth.service';
import type { IAuthService } from '@/services/interfaces/auth.service.interface';
import type { IUserService } from '@/services/interfaces/user.service.interface';
import { UserService } from '@/services/user.service';
import { type IUserTokenInfo, verifyAccessToken } from '@/utils/auth';

import { GRAPHQL_AUTH_WHITELIST } from './whitelist';

/**
 * Shared context object injected into every GraphQL resolver.
 *
 * @remarks
 * Add new service instances to `dataSources` and update this type when registering a new service.
 */
export interface GraphQLContext {
  req: ExpressRequest;
  res: ExpressResponse;
  currentUser: IUserTokenInfo | null;
  dataSources: {
    authService: IAuthService;
    userService: IUserService;
  };
}

/**
 * Factory that builds the {@link GraphQLContext} for each incoming GraphQL request.
 *
 * @param args - Express `req` and `res` from the HTTP layer.
 * @param args.req - Incoming Express request, available to resolvers for header inspection.
 * @param args.res - Outgoing Express response, used for setting cookies (e.g., refresh token).
 * @returns A promise resolving to a fully initialised {@link GraphQLContext}.
 */
export const createContext = async ({
  req,
  res,
}: {
  req: ExpressRequest;
  res: ExpressResponse;
}): Promise<GraphQLContext> => {
  const operationName: string | undefined = req.body?.operationName;
  let currentUser: IUserTokenInfo | null = null;

  if (!GRAPHQL_AUTH_WHITELIST.has(operationName ?? '')) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    try {
      currentUser = verifyAccessToken(authHeader.slice(7));
    } catch {
      throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
    }
  }

  const userService = new UserService();
  return {
    req,
    res,
    currentUser,
    dataSources: {
      authService: new AuthService(userService),
      userService,
    },
  };
};
