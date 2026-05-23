import { faker } from '@faker-js/faker';

import { Post } from '@/models/post.model';

export interface TestPost {
  id: string;
  body: string;
  authorId: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export async function createTestPost(userId: string, overrides: { body?: string } = {}): Promise<TestPost> {
  const doc = await Post.create({
    body: overrides.body ?? faker.lorem.sentence(),
    user: userId,
    username: 'testuser',
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  });

  return {
    id: doc._id.toString(),
    body: doc.body ?? '',
    authorId: userId,
    createdAt: doc.createdAt ?? new Date().toISOString(),
    likeCount: doc.likeCount ?? 0,
    commentCount: doc.commentCount ?? 0,
  };
}
