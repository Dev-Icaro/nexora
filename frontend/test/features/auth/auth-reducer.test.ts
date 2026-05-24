import { describe, expect, it } from 'vitest';

import { authReducer, initialAuthState } from '@/features/auth/state/auth-reducer';
import type { AuthState } from '@/features/auth/state/auth-reducer';

import { makeUser } from '../../mocks/data';

const user = makeUser();
const token = 'access-token-abc';

const authenticatedState: AuthState = {
  user,
  token,
  isAuthenticated: true,
  isInitializing: false,
};

describe('authReducer', () => {
  it('INITIALIZE_START sets isInitializing to true', () => {
    const state = authReducer({ ...initialAuthState, isInitializing: false }, { type: 'INITIALIZE_START' });
    expect(state.isInitializing).toBe(true);
  });

  it('LOGIN sets user, token, authenticated, and clears initializing', () => {
    const state = authReducer(initialAuthState, { type: 'LOGIN', payload: { user, token } });
    expect(state).toEqual({ user, token, isAuthenticated: true, isInitializing: false });
  });

  it('RESTORE_SESSION behaves identically to LOGIN', () => {
    const state = authReducer(initialAuthState, { type: 'RESTORE_SESSION', payload: { user, token } });
    expect(state).toEqual({ user, token, isAuthenticated: true, isInitializing: false });
  });

  it('INITIALIZE_DONE clears isInitializing without touching other state', () => {
    const before: AuthState = { ...initialAuthState, isInitializing: true };
    const state = authReducer(before, { type: 'INITIALIZE_DONE' });
    expect(state.isInitializing).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('LOGOUT resets to initial state with isInitializing false', () => {
    const state = authReducer(authenticatedState, { type: 'LOGOUT' });
    expect(state).toEqual({ ...initialAuthState, isInitializing: false });
  });

  it('UPDATE_USER merges fields into existing user', () => {
    const state = authReducer(authenticatedState, {
      type: 'UPDATE_USER',
      payload: { username: 'newname' },
    });
    expect(state.user).toEqual({ ...user, username: 'newname' });
  });

  it('UPDATE_USER is a no-op when user is null', () => {
    const state = authReducer(initialAuthState, {
      type: 'UPDATE_USER',
      payload: { username: 'newname' },
    });
    expect(state.user).toBeNull();
  });

  it('preserves unrelated state fields on every action', () => {
    const state = authReducer(authenticatedState, { type: 'INITIALIZE_DONE' });
    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });
});
