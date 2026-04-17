import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { AuthService } from '@/services/auth.service';
import type { IAuthService } from '@/services/interfaces/auth.service.interface';
import type { IUserService } from '@/services/interfaces/user.service.interface';
import { UserService } from '@/services/user.service';

/**
 * Shared context object injected into every GraphQL resolver.
 *
 * @remarks
 * Add new service instances to `dataSources` and update this type when registering a new service.
 */
export interface GraphQLContext {
  req: ExpressRequest;
  res: ExpressResponse;
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
  const userService = new UserService();
  return {
    req,
    res,
    dataSources: {
      authService: new AuthService(userService),
      userService,
    },
  };
};
