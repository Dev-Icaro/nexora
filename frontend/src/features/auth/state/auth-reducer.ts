export type AuthUser = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
};

export type AuthAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'RESTORE_SESSION'; payload: { user: AuthUser; token: string } }
  | { type: 'INITIALIZE_DONE' }
  | { type: 'LOGIN'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> };

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return { ...state, isInitializing: true };
    case 'RESTORE_SESSION':
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isInitializing: false,
      };
    case 'INITIALIZE_DONE':
      return { ...state, isInitializing: false };
    case 'LOGOUT':
      return { ...initialAuthState, isInitializing: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    default:
      return state;
  }
}
