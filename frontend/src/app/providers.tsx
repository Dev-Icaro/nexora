import { ApolloProvider } from '@apollo/client/react';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/features/auth/state/auth-provider';
import { Toaster } from '@/shared/components/ui/sonner';
import { client } from '@/shared/lib/apollo-client';
import { ThemeProvider } from '@/shared/providers/theme-provider';

import { router } from './router';

export function Providers() {
  return (
    <ThemeProvider>
      <ApolloProvider client={client}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}
