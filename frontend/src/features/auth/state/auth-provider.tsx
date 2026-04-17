import { useApolloClient } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { useEffect, useReducer } from 'react';

import { LOGOUT_MUTATION, REFRESH_MUTATION } from '@/features/auth/api/auth.mutations';
import type { LogoutResponse, RefreshResponse } from '@/features/auth/api/auth.types';
import { setAccessToken } from '@/shared/lib/token-store';

import { AuthContext } from './auth-context';
import type { AuthUser } from './auth-reducer';
import { authReducer, initialAuthState } from './auth-reducer';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const apolloClient = useApolloClient();

  useEffect(() => {
    const initializeSession = async () => {
      dispatch({ type: 'INITIALIZE_START' });
      try {
        const { data } = await apolloClient.mutate<RefreshResponse>({
          mutation: REFRESH_MUTATION,
        });

        const refreshData = data?.refresh;
        if (refreshData?.success && refreshData.accessToken && refreshData.user) {
          setAccessToken(refreshData.accessToken);
          dispatch({ type: 'RESTORE_SESSION', payload: { user: refreshData.user, token: refreshData.accessToken } });
        } else {
          dispatch({ type: 'INITIALIZE_DONE' });
        }
      } catch {
        dispatch({ type: 'INITIALIZE_DONE' });
      }
    };

    initializeSession();
  }, [apolloClient]);

  const login = (user: AuthUser, token: string) => {
    setAccessToken(token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
    apolloClient.mutate<LogoutResponse>({ mutation: LOGOUT_MUTATION }).catch(() => {});
  };

  return <AuthContext value={{ state, login, logout }}>{children}</AuthContext>;
}
