import type { ApiResponse } from '@/shared/types';

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  register: ApiResponse;
};
