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

export type PostAuthor = {
  id: string;
  username: string;
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
