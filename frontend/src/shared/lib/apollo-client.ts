import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  from,
  HttpLink,
  InMemoryCache,
  Observable,
  ServerError,
  split,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import { REFRESH_MUTATION } from '@/features/auth/api/auth.mutations';
import type { RefreshResponse } from '@/features/auth/api/auth.types';

import { getAccessToken, setAccessToken, triggerUnauthenticated } from './token-store';

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_BACKEND_URL}/graphql`,
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken();

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const getNewToken = (): Promise<string> => {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = client
    .mutate<RefreshResponse>({ mutation: REFRESH_MUTATION })
    .then(({ data }) => {
      const refresh = data?.refresh;
      if (refresh?.success && refresh.accessToken) {
        return refresh.accessToken;
      }
      throw new Error('Refresh failed');
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (operation.getContext().__retried) return;

  const isUnauthenticated =
    (CombinedGraphQLErrors.is(error) && error.errors.some(e => e.extensions?.code === 'UNAUTHORIZED')) ||
    (ServerError.is(error) && error.statusCode === 401);

  if (!isUnauthenticated) return;

  if (operation.operationName === 'Refresh' || operation.operationName === 'Logout') {
    if (operation.operationName === 'Refresh') triggerUnauthenticated();
    return;
  }

  return new Observable(subscriber => {
    getNewToken()
      .then(newToken => {
        setAccessToken(newToken);
        operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
          __retried: true,
          headers: { ...headers, authorization: `Bearer ${newToken}` },
        }));
        return forward(operation).subscribe(subscriber);
      })
      .catch(() => {
        triggerUnauthenticated();
        subscriber.error(new Error('Session expired'));
      });
  });
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws')}/graphql`,
    connectionParams: () => {
      const token = getAccessToken();
      return token ? { authorization: `Bearer ${token}` } : {};
    },
  }),
);

const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: {
    max: 3,
    retryIf: error => {
      if (!error) return false;
      const status = (error as { statusCode?: number }).statusCode;
      return status !== undefined ? status >= 500 : true;
    },
  },
});

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  from([retryLink, errorLink, authLink, httpLink]),
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
