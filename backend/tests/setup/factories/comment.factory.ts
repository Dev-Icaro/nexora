import { faker } from '@faker-js/faker';

import { Comment } from '@/models/comment.model';

export interface TestComment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  likeCount: number;
}

export async function createTestComment(
  userId: string,
  postId: string,
  overrides: { body?: string } = {},
): Promise<TestComment> {
  const doc = await Comment.create({
    postId,
    userId,
    username: 'testuser',
    body: overrides.body ?? faker.lorem.sentence(),
    likeCount: 0,
  });

  return {
    id: doc._id.toString(),
    postId: doc.postId.toString(),
    authorId: doc.userId.toString(),
    body: doc.body,
    likeCount: doc.likeCount ?? 0,
  };
}
