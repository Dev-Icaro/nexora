import type { ApiResponse } from '@/shared/types';

export type CreatePostRequest = {
  body: string;
  mediaUrl?: string;
};

export type CreatePostResponse = {
  createPost: ApiResponse & {
    post?: {
      id: string;
      body: string;
      mediaUrl: string | null;
      createdAt: string;
      username: string;
    };
  };
};
