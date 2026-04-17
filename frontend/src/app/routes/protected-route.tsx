import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';

export function ProtectedRoute() {
  const { state } = useAuth();

  if (state.isInitializing) {
    return null;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
