import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing/react';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthContext } from '@/features/auth/state/auth-context';
import type { AuthContextValue } from '@/features/auth/state/auth-context';
import type { AuthState } from '@/features/auth/state/auth-reducer';

export type ProviderOptions = {
  mocks?: MockedResponse[];
  authContext?: AuthContextValue;
  initialEntries?: string[];
};

export function makeAuthContext(overrides?: {
  state?: Partial<AuthState>;
  login?: AuthContextValue['login'];
  logout?: AuthContextValue['logout'];
  updateUser?: AuthContextValue['updateUser'];
}): AuthContextValue {
  return {
    login: overrides?.login ?? vi.fn(),
    logout: overrides?.logout ?? vi.fn(),
    updateUser: overrides?.updateUser ?? vi.fn(),
    state: {
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
      ...overrides?.state,
    },
  };
}

export function renderWithProviders(
  ui: ReactElement,
  { mocks = [], authContext, initialEntries = ['/'] }: ProviderOptions = {},
) {
  const auth = authContext ?? makeAuthContext();
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext value={auth}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </AuthContext>
    </MockedProvider>,
  );
}

export function createWrapper({ mocks = [], authContext }: Omit<ProviderOptions, 'initialEntries'> = {}) {
  const auth = authContext ?? makeAuthContext();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext value={auth}>
          <MemoryRouter>{children}</MemoryRouter>
        </AuthContext>
      </MockedProvider>
    );
  };
}
