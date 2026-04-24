import type { GraphQLContext } from '@/graphql/context';

export const userQueries = {
  getUserById: async (_: unknown, { userId }: { userId: string }, { dataSources }: GraphQLContext) => {
    return await dataSources.userService.findById(userId);
  },
};
