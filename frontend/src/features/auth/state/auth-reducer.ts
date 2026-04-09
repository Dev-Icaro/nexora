export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
};

export type AuthAction = { type: 'LOGIN'; payload: { user: AuthUser; token: string } } | { type: 'LOGOUT' };

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('auth_token', action.payload.token);
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      localStorage.removeItem('auth_token');
      return initialAuthState;
    default:
      return state;
  }
}
