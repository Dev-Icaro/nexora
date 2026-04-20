import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  from,
  HttpLink,
  InMemoryCache,
  Observable,
  ServerError,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';

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

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
