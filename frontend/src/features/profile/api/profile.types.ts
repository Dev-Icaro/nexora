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
  objectKey?: string;
};

export type UpdateProfileUser = {
  id: string;
  email: string;
  username: string;
  bio?: string;
  position?: string;
  avatarUrl?: string;
};

export type UpdateProfileResponse = {
  updateProfile: ApiResponse & { user?: UpdateProfileUser };
};

export type GetAvatarUploadUrlInput = {
  filename: string;
  contentType: string;
  fileSizeBytes: number;
};

export type GetAvatarUploadUrlRequest = { request: GetAvatarUploadUrlInput };

export type GetAvatarUploadUrlResponse = {
  getAvatarUploadUrl: {
    code: number;
    message: string;
    success: boolean;
    uploadUrl?: string;
    fields?: string;
    objectKey?: string;
  };
};
