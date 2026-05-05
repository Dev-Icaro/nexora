import type { GraphQLContext } from '@/graphql/context';

export const authQueries = {
  validatePasswordResetToken: async (_: unknown, { token }: { token: string }, { dataSources }: GraphQLContext) =>
    dataSources.authService.validatePasswordResetToken(token),
};
