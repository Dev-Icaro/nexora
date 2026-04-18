import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';

import connectDatabase from '@/config/database';
import env from '@/config/environment';
import { createContext, type GraphQLContext } from '@/graphql/context';
import { commentResolver } from '@/graphql/resolvers/comment.resolver';
import { mutationResolver } from '@/graphql/resolvers/mutation.resolver';
import { postResolver } from '@/graphql/resolvers/post.resolver';
import { userResolver } from '@/graphql/resolvers/user.resolver';
import { typeDefs } from '@/graphql/typeDefs';
import { authRouter } from '@/http/routes/auth.router';
import logger from '@/utils/logger';

import errorHandler from './http/middlewares/error-handler';

const resolvers = [postResolver, mutationResolver, userResolver, commentResolver];

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const app = express();
  app.use(cors<cors.CorsRequest>({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  const httpServer = http.createServer(app);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use('/auth', authRouter);
  app.use('/graphql', expressMiddleware(server, { context: createContext }));

  app.use(errorHandler);

  await new Promise<void>(resolve => httpServer.listen({ port: env.APP_PORT }, resolve));
  logger.info(`GraphQL server ready at http://localhost:${env.APP_PORT}/graphql`);
};

bootstrap().catch(error => logger.error(error));
