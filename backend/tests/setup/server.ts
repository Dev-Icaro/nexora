import { ApolloServer, type BaseContext } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { vi } from 'vitest';

import { apolloErrorHandler } from '@/graphql/apollo-error-handler';
import type { GraphQLContext } from '@/graphql/context';
import { createLoaders } from '@/graphql/loaders';
import { authResolver } from '@/graphql/resolvers/auth.resolver';
import { postResolver } from '@/graphql/resolvers/post.resolver';
import { userResolver } from '@/graphql/resolvers/user.resolver';
import { typeDefs } from '@/graphql/typeDefs';
import type { IEmailService } from '@/services/email/email.service.interface';
import type { IStorageProvider } from '@/services/interfaces/storage-provider.interface';
import { AuthService } from '@/services/auth.service';
import { CommentService } from '@/services/comment.service';
import { FollowService } from '@/services/follow.service';
import { PostService } from '@/services/post.service';
import { UserService } from '@/services/user.service';

import { createMockEmailService } from './mocks/email.mock';
import { createMockStorageProvider } from './mocks/storage.mock';

interface TestServerOverrides {
  emailService?: IEmailService;
  storageProvider?: IStorageProvider;
}

interface BuildContextOptions {
  userId?: string;
  cookies?: Record<string, string>;
}

export interface TestResponse {
  data?: Record<string, unknown> | null;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

export function singleResult(
  response: Awaited<ReturnType<ApolloServer<BaseContext>['executeOperation']>>,
): TestResponse {
  if (response.body.kind !== 'single') throw new Error('Expected a single GraphQL result');
  return response.body.singleResult as TestResponse;
}

export function createTestServer(overrides: TestServerOverrides = {}) {
  const emailService = overrides.emailService ?? createMockEmailService();
  const storageProvider = overrides.storageProvider ?? createMockStorageProvider();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: [authResolver, postResolver, userResolver],
  });

  const server = new ApolloServer<GraphQLContext>({
    schema,
    formatError: apolloErrorHandler,
  });

  function buildContext(options: BuildContextOptions = {}): GraphQLContext {
    const userService = new UserService(storageProvider);

    const req = {
      headers: {},
      cookies: options.cookies ?? {},
      body: {},
    } as unknown as ExpressRequest;

    const res = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as ExpressResponse;

    return {
      req,
      res,
      currentUser: options.userId ? { userId: options.userId } : null,
      loaders: createLoaders(options.userId ?? null),
      dataSources: {
        authService: new AuthService(userService, emailService),
        userService,
        postService: new PostService(userService, storageProvider),
        commentService: new CommentService(userService),
        followService: new FollowService(userService),
        storageProvider,
      },
    };
  }

  return { server, buildContext };
}
