import type { PostDto } from '@/dtos/post';
import type { Resolvers } from '@/graphql/__generated__/types';
import { pubsub, TOPICS } from '@/graphql/pubsub';

export const subscriptionResolver: Resolvers = {
  Subscription: {
    newPost: {
      subscribe: () => pubsub.asyncIterableIterator(TOPICS.NEW_POST),
      resolve: (payload: { newPost: PostDto }) => payload.newPost,
    },
  },
};
