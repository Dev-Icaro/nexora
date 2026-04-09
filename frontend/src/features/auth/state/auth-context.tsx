import type { ReactNode } from 'react';
import { createContext, useContext, useReducer } from 'react';

import type { AuthState, AuthUser } from './auth-reducer';
import { authReducer, initialAuthState } from './auth-reducer';

type AuthContextValue = {
  state: AuthState;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const login = (user: AuthUser, token: string) => {
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return <AuthContext value={{ state, login, logout }}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
