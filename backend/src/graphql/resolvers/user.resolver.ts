import { userQueries } from '@/graphql/queries/user.query';

export const userResolver = {
  Query: {
    ...userQueries,
  },
};
