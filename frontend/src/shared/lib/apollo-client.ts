import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
  Observable,
  ServerError,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import { REFRESH_MUTATION } from '@/features/auth/api/auth.mutations';

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
    .mutate({ mutation: REFRESH_MUTATION })
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
    (CombinedGraphQLErrors.is(error) && error.errors.some(e => e.extensions?.code === 'UNAUTHENTICATED')) ||
    (ServerError.is(error) && error.statusCode === 401);

  if (!isUnauthenticated) return;

  if (
    operation.operationName === 'Refresh' ||
    operation.operationName === 'Logout' ||
    operation.operationName === 'Login'
  ) {
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

const transactionIdLink = new ApolloLink((operation, forward) => {
  const def = getMainDefinition(operation.query);
  if (def.kind === 'OperationDefinition' && def.operation === 'mutation') {
    operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
      headers: { ...headers, 'x-transaction-id': crypto.randomUUID() },
    }));
  }
  return forward(operation);
});

const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: {
    max: 3,
    retryIf: (error, operation) => {
      if (!error) return false;
      if (
        operation.operationName === 'Refresh' ||
        operation.operationName === 'Logout' ||
        operation.operationName === 'Login'
      )
        return false;
      const status = (error as { statusCode?: number }).statusCode;
      return status !== undefined ? status >= 500 : true;
    },
  },
});

const splitLink = ApolloLink.split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  ApolloLink.from([transactionIdLink, retryLink, errorLink, authLink, httpLink]),
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
