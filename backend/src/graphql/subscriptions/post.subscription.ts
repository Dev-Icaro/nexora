import { pubsub, TOPICS } from '@/graphql/pubsub';

export const postSubscriptions = {
  newPost: {
    subscribe: () => pubsub.asyncIterableIterator(TOPICS.NEW_POST),
    resolve: (payload: { newPost: unknown }) => payload.newPost,
  },
};
