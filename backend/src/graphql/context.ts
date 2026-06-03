import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { UnauthorizedException } from '@/exceptions';
import { AuthService } from '@/services/auth.service';
import S3StorageProvider from '@/services/cloud/s3-storage.provider';
import { CommentService } from '@/services/comment.service';
import { ResendEmailService } from '@/services/email/resend-email.service';
import { FollowService } from '@/services/follow.service';
import type { IAuthService } from '@/services/interfaces/auth.service.interface';
import type { ICommentService } from '@/services/interfaces/comment.service.interface';
import type { IFollowService } from '@/services/interfaces/follow.service.interface';
import type { IPostService } from '@/services/interfaces/post.service.interface';
import type { IStorageProvider } from '@/services/interfaces/storage-provider.interface';
import type { IUserService } from '@/services/interfaces/user.service.interface';
import { PostService } from '@/services/post.service';
import { UserService } from '@/services/user.service';
import { setUserId } from '@/utils/async-context';
import { type IUserTokenInfo, verifyAccessToken } from '@/utils/auth';

import { createLoaders, type Loaders } from './loaders';
import { GRAPHQL_AUTH_WHITELIST } from './whitelist';

type DataSources = {
  authService: IAuthService;
  userService: IUserService;
  postService: IPostService;
  commentService: ICommentService;
  followService: IFollowService;
  storageProvider: IStorageProvider;
};

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
  loaders: Loaders;
  dataSources: DataSources;
}

/**
 * Context injected into subscription resolvers over WebSocket.
 *
 * @remarks
 * WebSocket connections have no Express req/res. Post field resolvers only
 * access loaders and dataSources, so subscriptions are fully functional
 * without the HTTP layer.
 */
export interface SubscriptionContext {
  currentUser: IUserTokenInfo | null;
  loaders: Loaders;
  dataSources: DataSources;
}

const emailService = new ResendEmailService();
const storageProvider = new S3StorageProvider();
const userService = new UserService(storageProvider);

const dataSources: DataSources = {
  authService: new AuthService(userService, emailService),
  userService,
  postService: new PostService(userService, storageProvider),
  commentService: new CommentService(userService),
  followService: new FollowService(userService),
  storageProvider,
};

/**
 * Builds a {@link SubscriptionContext} for an incoming WebSocket connection.
 *
 * @param connectionParams - The connectionParams object sent by the client on connect.
 * @returns A fully initialised {@link SubscriptionContext}.
 * @throws {GraphQLError} with code UNAUTHORIZED if no valid Bearer token is present.
 */
export const createSubscriptionContext = async (
  connectionParams: Record<string, unknown>,
): Promise<SubscriptionContext> => {
  const authorization =
    typeof connectionParams['authorization'] === 'string' ? connectionParams['authorization'] : undefined;

  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedException();
  }

  let currentUser: IUserTokenInfo | null;
  try {
    currentUser = verifyAccessToken(authorization.slice(7));
  } catch {
    throw new UnauthorizedException();
  }

  setUserId(currentUser.userId);
  return { currentUser, loaders: createLoaders(currentUser.userId), dataSources };
};

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
      throw new UnauthorizedException();
    }
    try {
      currentUser = verifyAccessToken(authHeader.slice(7));
    } catch {
      throw new UnauthorizedException();
    }
    setUserId(currentUser.userId);
  }

  return {
    req,
    res,
    currentUser,
    loaders: createLoaders(currentUser?.userId ?? null),
    dataSources,
  };
};
