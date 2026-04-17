import type { ApiResponse } from '@/shared/types';

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  register: ApiResponse;
};

export type LoginResponse = {
  login: ApiResponse & {
    accessToken: string | null;
    user?: {
      id: string;
      email: string;
      username: string;
    };
  };
};

export type RefreshResponse = {
  refresh: ApiResponse & {
    accessToken: string | null;
    user?: {
      id: string;
      email: string;
      username: string;
    };
  };
};

export type LogoutResponse = {
  logout: ApiResponse;
};
