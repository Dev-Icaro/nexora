import { authQueries } from '@/graphql/queries/auth.query';

export const authResolver = {
  Query: {
    ...authQueries,
  },
};
