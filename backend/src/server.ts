import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { useServer } from 'graphql-ws/use/ws';
import http from 'http';
import { WebSocketServer } from 'ws';

import connectDatabase from '@/config/database';
import env from '@/config/environment';
import { apolloErrorHandler } from '@/graphql/apollo-error-handler';
import { createContext, createSubscriptionContext, type GraphQLContext } from '@/graphql/context';
import { rateLimiterPlugin } from '@/graphql/plugins/rate-limiter.plugin';
import { authResolver } from '@/graphql/resolvers/auth.resolver';
import { postResolver } from '@/graphql/resolvers/post.resolver';
import { subscriptionResolver } from '@/graphql/resolvers/subscription.resolver';
import { userResolver } from '@/graphql/resolvers/user.resolver';
import { typeDefs } from '@/graphql/typeDefs';
import { startCleanupPendingUploadsJob } from '@/jobs/cleanup-pending-uploads.job';
import { startReconcileStorageCountersJob } from '@/jobs/reconcile-storage-counters.job';
import httpErrorHandler from '@/rest/middlewares/error-handler';
import { transactionIdMiddleware } from '@/rest/middlewares/transaction-id.middleware';
import { authRouter } from '@/rest/routes/auth.router';
import logger from '@/utils/logger';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: [authResolver, postResolver, userResolver, subscriptionResolver],
});

const bootstrap = async (): Promise<void> => {
  await connectDatabase();
  startCleanupPendingUploadsJob();
  startReconcileStorageCountersJob();

  const app = express();
  app.use(cors<cors.CorsRequest>({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(transactionIdMiddleware);

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
  const wsServerCleanup = useServer(
    {
      schema,
      context: async ctx => createSubscriptionContext((ctx.connectionParams ?? {}) as Record<string, unknown>),
    },
    wsServer,
  );

  const server = new ApolloServer<GraphQLContext>({
    schema,
    formatError: apolloErrorHandler,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsServerCleanup.dispose();
            },
          };
        },
      },
      rateLimiterPlugin,
    ],
  });

  await server.start();

  app.use('/auth', authRouter);
  app.use('/graphql', expressMiddleware(server, { context: createContext }));
  app.use(httpErrorHandler);

  await new Promise<void>(resolve => httpServer.listen({ port: env.APP_PORT }, resolve));
  logger.info(`GraphQL server ready at http://localhost:${env.APP_PORT}/graphql`);
  logger.info(`GraphQL subscriptions ready at ws://localhost:${env.APP_PORT}/graphql`);
};

bootstrap().catch(error => logger.error(error));
