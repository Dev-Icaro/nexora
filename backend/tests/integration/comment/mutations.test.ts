import { beforeEach, describe, expect, it } from 'vitest';

import { CommentLike } from '@/models/comment-like.model';
import { Comment } from '@/models/comment.model';
import { clearDb } from '../../setup/db';
import { createTestComment } from '../../setup/factories/comment.factory';
import { createTestPost } from '../../setup/factories/post.factory';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const LIKE_COMMENT = `
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      code
      success
      message
      comment { id likeCount }
    }
  }
`;

const UNLIKE_COMMENT = `
  mutation UnlikeComment($commentId: ID!) {
    unlikeComment(commentId: $commentId) {
      code
      success
      message
      comment { id likeCount }
    }
  }
`;

describe('likeComment', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('creates a CommentLike record and increments likeCount', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const comment = await createTestComment(user.id, post.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: LIKE_COMMENT, variables: { commentId: comment.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.likeComment as {
      code: number;
      success: boolean;
      message: string;
      comment: { id: string; likeCount: number };
    };
    expect(result.code).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/liked/i);
    expect(result.comment.likeCount).toBe(1);

    const like = await CommentLike.findOne({ commentId: comment.id, userId: user.id });
    expect(like).not.toBeNull();
  });

  it('returns CONFLICT when the user already liked the comment', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const comment = await createTestComment(user.id, post.id);
    const ctx = () => buildContext({ userId: user.id });

    await server.executeOperation(
      { query: LIKE_COMMENT, variables: { commentId: comment.id } },
      { contextValue: ctx() },
    );

    const { errors } = singleResult(
      await server.executeOperation(
        { query: LIKE_COMMENT, variables: { commentId: comment.id } },
        { contextValue: ctx() },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('CONFLICT');

    const count = await CommentLike.countDocuments({ commentId: comment.id, userId: user.id });
    expect(count).toBe(1);
  });

  it('returns NOT_FOUND for a non-existent comment', async () => {
    const user = await createTestUser();

    const { errors } = singleResult(
      await server.executeOperation(
        { query: LIKE_COMMENT, variables: { commentId: '000000000000000000000000' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('NOT_FOUND');
  });
});

describe('unlikeComment', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('removes the CommentLike record and decrements likeCount', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const comment = await createTestComment(user.id, post.id);
    const ctx = () => buildContext({ userId: user.id });

    await server.executeOperation(
      { query: LIKE_COMMENT, variables: { commentId: comment.id } },
      { contextValue: ctx() },
    );

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: UNLIKE_COMMENT, variables: { commentId: comment.id } },
        { contextValue: ctx() },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.unlikeComment as {
      code: number;
      success: boolean;
      message: string;
      comment: { id: string; likeCount: number };
    };
    expect(result.code).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/unliked/i);
    expect(result.comment.likeCount).toBe(0);

    const like = await CommentLike.findOne({ commentId: comment.id, userId: user.id });
    expect(like).toBeNull();
  });

  it('returns NOT_FOUND when the user has not liked the comment', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const comment = await createTestComment(user.id, post.id);

    const { errors } = singleResult(
      await server.executeOperation(
        { query: UNLIKE_COMMENT, variables: { commentId: comment.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND for a non-existent comment', async () => {
    const user = await createTestUser();

    await CommentLike.create({
      commentId: '000000000000000000000000',
      userId: user.id,
      username: 'testuser',
    });

    const { errors } = singleResult(
      await server.executeOperation(
        { query: UNLIKE_COMMENT, variables: { commentId: '000000000000000000000000' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('NOT_FOUND');
  });
});

describe('likeComment and unlikeComment DB consistency', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('likeCount in DB matches after a like-then-unlike sequence', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const comment = await createTestComment(user.id, post.id);
    const ctx = () => buildContext({ userId: user.id });

    await server.executeOperation(
      { query: LIKE_COMMENT, variables: { commentId: comment.id } },
      { contextValue: ctx() },
    );
    await server.executeOperation(
      { query: UNLIKE_COMMENT, variables: { commentId: comment.id } },
      { contextValue: ctx() },
    );

    const dbComment = await Comment.findById(comment.id);
    expect(dbComment?.likeCount).toBe(0);
    expect(await CommentLike.countDocuments({ commentId: comment.id })).toBe(0);
  });
});
