import '@/ioc/container';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

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

  const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    context: createContext,
    listen: { port: env.APP_PORT },
  });

  logger.info(`GraphQL server ready at ${url}`);
};

bootstrap().catch(error => logger.error(error));
