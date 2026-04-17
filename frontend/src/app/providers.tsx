import { ApolloProvider } from '@apollo/client/react';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/features/auth/state/auth-provider';
import { client } from '@/shared/lib/apollo-client';

import { router } from './router';

export function Providers() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApolloProvider>
  );
}
