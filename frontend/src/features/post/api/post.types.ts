import type { ApiResponse, Edge, PageInfo } from '@/shared/types';

export type CreatePostRequest = {
  body: string;
  objectKey?: string;
};

export type GetUploadUrlInput = {
  filename: string;
  contentType: string;
  fileSizeBytes: number;
};

export type GetUploadUrlRequest = {
  request: GetUploadUrlInput;
};

export type GetUploadUrlResponse = {
  getUploadUrl: {
    code: number;
    message: string;
    success: boolean;
    uploadUrl?: string;
    fields?: string;
    objectKey?: string;
  };
};

export type CreatePostResponse = {
  createPost: ApiResponse & {
    post?: PostNode;
  };
};

export type PostAuthor = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type PostNode = {
  id: string;
  body: string;
  mediaUrl: string | null;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likes: Array<{ id: string; author: { id: string; username: string } }>;
};

export type FeedResponse = {
  feed: {
    edges: Edge<PostNode>[];
    pageInfo: PageInfo;
  };
};

export type FeedRequest = { first?: number; after?: string };

export type UserPostsRequest = { userId: string; first?: number; after?: string };
export type UserPostsResponse = {
  getUserPosts: {
    edges: Edge<PostNode>[];
    pageInfo: PageInfo;
  };
};
