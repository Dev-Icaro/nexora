import { createContext } from 'react';

import type { AuthUser } from './auth-reducer';
import type { AuthState } from './auth-reducer';

export type AuthContextValue = {
  state: AuthState;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
