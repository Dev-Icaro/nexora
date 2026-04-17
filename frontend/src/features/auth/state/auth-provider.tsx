import type { ReactNode } from 'react';
import { useEffect, useReducer } from 'react';

import { setAccessToken } from '@/shared/lib/token-store';

import { AuthContext } from './auth-context';
import type { AuthUser } from './auth-reducer';
import { authReducer, initialAuthState } from './auth-reducer';

// Replace with real session restore (e.g. silent refresh token request) when available.
async function refreshSession(): Promise<{ user: AuthUser; token: string } | null> {
  return null;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const initializeSession = async () => {
      dispatch({ type: 'INITIALIZE_START' });
      try {
        const session = await refreshSession();
        if (session) {
          setAccessToken(session.token);
          dispatch({ type: 'RESTORE_SESSION', payload: session });
        } else {
          dispatch({ type: 'INITIALIZE_DONE' });
        }
      } catch {
        dispatch({ type: 'INITIALIZE_DONE' });
      }
    };

    initializeSession();
  }, []);

  const login = (user: AuthUser, token: string) => {
    setAccessToken(token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  return <AuthContext value={{ state, login, logout }}>{children}</AuthContext>;
}
