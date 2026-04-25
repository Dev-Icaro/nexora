import type { ApiResponse } from '@/shared/types';

export type ProfileUser = {
  id: string;
  username: string;
  bio?: string;
  position?: string;
  avatarUrl?: string;
  email: string;
};

export type GetProfileRequest = { userId: string };
export type GetProfileResponse = { getUserById: ProfileUser };

export type UpdateProfileRequest = {
  bio?: string;
  position?: string;
};

export type UpdateProfileUser = {
  id: string;
  email: string;
  username: string;
  bio?: string;
  position?: string;
};

export type UpdateProfileResponse = {
  updateProfile: ApiResponse & { user?: UpdateProfileUser };
};
