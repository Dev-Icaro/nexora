import { PubSub } from 'graphql-subscriptions';

/** Application-wide in-process PubSub channel. */
export const pubsub = new PubSub();

/** Subscription topic emitted when a new post is successfully created. */
export const TOPICS = {
  NEW_POST: 'NEW_POST',
} as const;
