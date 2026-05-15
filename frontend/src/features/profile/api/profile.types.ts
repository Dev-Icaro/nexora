import type { ApiResponse } from '@/shared/types';

export type StorageInfo = {
  usedBytes: number;
  quotaBytes: number;
  remainingBytes: number;
  usedPercent: number;
};

export type ProfileUser = {
  id: string;
  username: string;
  bio?: string;
  position?: string;
  avatarUrl?: string;
  email: string;
  storageInfo: StorageInfo;
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
