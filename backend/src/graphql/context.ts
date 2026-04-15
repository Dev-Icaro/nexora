import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { AuthService } from '@/services/auth.service';
import type { IAuthService } from '@/services/interfaces/auth.service.interface';
import type { IUserService } from '@/services/interfaces/user.service.interface';
import { UserService } from '@/services/user.service';

export interface GraphQLContext {
  res: ExpressResponse;
  dataSources: {
    authService: IAuthService;
    userService: IUserService;
  };
}

export const createContext = async ({
  res,
}: {
  req: ExpressRequest;
  res: ExpressResponse;
}): Promise<GraphQLContext> => {
  const userService = new UserService();
  return {
    res,
    dataSources: {
      authService: new AuthService(userService),
      userService,
    },
  };
};
