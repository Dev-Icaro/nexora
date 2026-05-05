import { postSubscriptions } from '@/graphql/subscriptions/post.subscription';

export const subscriptionResolver = {
  Subscription: {
    ...postSubscriptions,
  },
};
