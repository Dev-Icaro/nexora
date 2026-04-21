import type { ApiResponse, Edge, PageInfo } from '@/shared/types';

export type CreatePostRequest = {
  body: string;
  mediaUrl?: string;
};

export type CreatePostResponse = {
  createPost: ApiResponse & {
    post?: PostNode;
  };
};

export type PostNode = {
  id: string;
  body: string;
  mediaUrl: string | null;
  createdAt: string;
  username: string;
  likeCount: number;
  commentCount: number;
};

export type FeedResponse = {
  feed: {
    edges: Edge<PostNode>[];
    pageInfo: PageInfo;
  };
};

export type FeedRequest = { first?: number; after?: string };
