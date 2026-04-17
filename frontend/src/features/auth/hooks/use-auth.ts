import { useContext } from 'react';

import type { AuthContextValue } from '../state/auth-context';
import { AuthContext } from '../state/auth-context';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
