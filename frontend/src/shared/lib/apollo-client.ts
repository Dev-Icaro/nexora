import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';

import { getAccessToken } from './token-store';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
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

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
