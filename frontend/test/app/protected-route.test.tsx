import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/app/routes/protected-route';
import { PublicOnlyRoute } from '@/app/routes/public-only-route';
import { AuthContext } from '@/features/auth/state/auth-context';
import { initialAuthState } from '@/features/auth/state/auth-reducer';

import { makeAuthContext } from '../utils';
import { makeUser } from '../mocks/data';

function renderWithRoutes(authContext: ReturnType<typeof makeAuthContext>, initialEntry = '/protected') {
  render(
    <AuthContext value={authContext}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected content</div>} />
          </Route>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Login page</div>} />
          </Route>
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext>,
  );
}

describe('ProtectedRoute', () => {
  it('renders nothing while session is initializing', () => {
    const auth = makeAuthContext({ state: { isInitializing: true } });
    renderWithRoutes(auth);
    expect(screen.queryByText('Protected content')).toBeNull();
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('redirects to /login when not authenticated', () => {
    const auth = makeAuthContext({ state: { isAuthenticated: false, isInitializing: false } });
    renderWithRoutes(auth);
    expect(screen.queryByText('Protected content')).toBeNull();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the outlet when authenticated', () => {
    const auth = makeAuthContext({
      state: {
        user: makeUser(),
        token: 'token',
        isAuthenticated: true,
        isInitializing: false,
      },
    });
    renderWithRoutes(auth);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});

describe('PublicOnlyRoute', () => {
  it('renders nothing while session is initializing', () => {
    const auth = makeAuthContext({ state: { isInitializing: true } });
    renderWithRoutes(auth, '/login');
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('redirects to "/" when already authenticated', () => {
    const auth = makeAuthContext({
      state: {
        user: makeUser(),
        token: 'token',
        isAuthenticated: true,
        isInitializing: false,
      },
    });
    renderWithRoutes(auth, '/login');
    expect(screen.queryByText('Login page')).toBeNull();
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders the outlet when not authenticated', () => {
    const auth = makeAuthContext({
      state: { ...initialAuthState, isInitializing: false },
    });
    renderWithRoutes(auth, '/login');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
