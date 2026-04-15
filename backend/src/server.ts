import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
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
import logger from '@/utils/logger';

const resolvers = [postResolver, mutationResolver, userResolver, commentResolver];

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: env.CORS_ORIGIN, credentials: true }),
    express.json(),
    expressMiddleware(server, { context: createContext }),
  );

  await new Promise<void>(resolve => httpServer.listen({ port: env.APP_PORT }, resolve));
  logger.info(`GraphQL server ready at http://localhost:${env.APP_PORT}/graphql`);
};

bootstrap().catch(error => logger.error(error));
