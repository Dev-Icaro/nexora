import { beforeEach, describe, expect, it } from 'vitest';

import { Post } from '@/models/post.model';
import { Like } from '@/models/like.model';
import { Comment } from '@/models/comment.model';
import { Bookmark } from '@/models/bookmark.model';
import { clearDb } from '../../setup/db';
import { createTestPost } from '../../setup/factories/post.factory';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const CREATE_POST = `
  mutation CreatePost($body: String!) {
    createPost(body: $body) {
      code
      success
      post { id body author { id } }
    }
  }
`;

const DELETE_POST = `
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId) {
      code
      success
      message
    }
  }
`;

const LIKE_POST = `
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      code
      success
      message
      post { id likeCount }
    }
  }
`;

const CREATE_COMMENT = `
  mutation CreateComment($postId: String!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      code
      success
      comment { id body author { id } }
    }
  }
`;

const DELETE_COMMENT = `
  mutation DeleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      code
      success
    }
  }
`;

describe('createPost', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('creates a text post and returns 201', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: CREATE_POST, variables: { body: 'My first post' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.createPost).toMatchObject({ code: 201, success: true });

    const post = data?.createPost as { post: { id: string; body: string; author: { id: string } } };
    expect(post.post.body).toBe('My first post');
    expect(post.post.author.id).toBe(user.id);

    const dbPost = await Post.findById(post.post.id);
    expect(dbPost).not.toBeNull();
  });
});

describe('deletePost', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('deletes the post when the caller is the owner', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: DELETE_POST, variables: { postId: post.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.deletePost).toMatchObject({ code: 200, success: true });
    expect(await Post.findById(post.id)).toBeNull();
  });

  it('returns FORBIDDEN when a different user tries to delete', async () => {
    const owner = await createTestUser();
    const intruder = await createTestUser();
    const post = await createTestPost(owner.id);

    const { errors } = singleResult(
      await server.executeOperation(
        { query: DELETE_POST, variables: { postId: post.id } },
        { contextValue: buildContext({ userId: intruder.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('FORBIDDEN');
    expect(await Post.findById(post.id)).not.toBeNull();
  });

  it('returns NOT_FOUND for a non-existent post', async () => {
    const user = await createTestUser();

    const { errors } = singleResult(
      await server.executeOperation(
        { query: DELETE_POST, variables: { postId: '000000000000000000000000' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('NOT_FOUND');
  });
});

describe('likePost', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('likes a post and increments likeCount', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: LIKE_POST, variables: { postId: post.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.likePost as { message: string; post: { likeCount: number } };
    expect(result.message).toMatch(/liked/i);
    expect(result.post.likeCount).toBeGreaterThan(0);

    const like = await Like.findOne({ postId: post.id, userId: user.id });
    expect(like).not.toBeNull();
  });

  it('unlikes a post on the second call (toggle)', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const ctx = () => buildContext({ userId: user.id });

    await server.executeOperation({ query: LIKE_POST, variables: { postId: post.id } }, { contextValue: ctx() });

    const { data } = singleResult(
      await server.executeOperation({ query: LIKE_POST, variables: { postId: post.id } }, { contextValue: ctx() }),
    );

    const result = data?.likePost as { message: string; post: { likeCount: number } };
    expect(result.message).toMatch(/unliked/i);
    expect(result.post.likeCount).toBe(0);
    expect(await Like.findOne({ postId: post.id, userId: user.id })).toBeNull();
  });
});

const ADD_BOOKMARK = `
  mutation AddBookmark($postId: ID!) {
    addBookmark(postId: $postId) {
      code
      success
      message
      post { id isBookmarked }
    }
  }
`;

const REMOVE_BOOKMARK = `
  mutation RemoveBookmark($postId: ID!) {
    removeBookmark(postId: $postId) {
      code
      success
      message
      post { id isBookmarked }
    }
  }
`;

describe('addBookmark', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('bookmarks a post and returns isBookmarked true', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: ADD_BOOKMARK, variables: { postId: post.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.addBookmark as {
      code: number;
      success: boolean;
      message: string;
      post: { id: string; isBookmarked: boolean };
    };
    expect(result.code).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/bookmarked/i);
    expect(result.post.isBookmarked).toBe(true);

    const bookmark = await Bookmark.findOne({ postId: post.id, userId: user.id });
    expect(bookmark).not.toBeNull();
  });

  it('is idempotent — bookmarking the same post twice does not error', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const ctx = () => buildContext({ userId: user.id });

    await server.executeOperation({ query: ADD_BOOKMARK, variables: { postId: post.id } }, { contextValue: ctx() });

    const { data, errors } = singleResult(
      await server.executeOperation({ query: ADD_BOOKMARK, variables: { postId: post.id } }, { contextValue: ctx() }),
    );

    expect(errors).toBeUndefined();
    expect((data?.addBookmark as { success: boolean }).success).toBe(true);

    const count = await Bookmark.countDocuments({ postId: post.id, userId: user.id });
    expect(count).toBe(1);
  });

  it('returns NOT_FOUND for a non-existent post', async () => {
    const user = await createTestUser();

    const { errors } = singleResult(
      await server.executeOperation(
        { query: ADD_BOOKMARK, variables: { postId: '000000000000000000000000' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('NOT_FOUND');
  });
});

describe('removeBookmark', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('removes a bookmark and returns isBookmarked false', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);
    const ctx = () => buildContext({ userId: user.id });

    await server.executeOperation({ query: ADD_BOOKMARK, variables: { postId: post.id } }, { contextValue: ctx() });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REMOVE_BOOKMARK, variables: { postId: post.id } },
        { contextValue: ctx() },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.removeBookmark as {
      code: number;
      success: boolean;
      message: string;
      post: { id: string; isBookmarked: boolean };
    };
    expect(result.code).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/unbookmarked/i);
    expect(result.post.isBookmarked).toBe(false);

    const bookmark = await Bookmark.findOne({ postId: post.id, userId: user.id });
    expect(bookmark).toBeNull();
  });

  it('is idempotent — removing a non-existent bookmark does not error', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REMOVE_BOOKMARK, variables: { postId: post.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect((data?.removeBookmark as { success: boolean }).success).toBe(true);
  });
});

describe('createComment / deleteComment', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('creates a comment on a post', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: CREATE_COMMENT, variables: { postId: post.id, body: 'Nice post!' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.createComment as { comment: { id: string; body: string; author: { id: string } } };
    expect(result.comment.body).toBe('Nice post!');
    expect(result.comment.author.id).toBe(user.id);

    const comment = await Comment.findById(result.comment.id);
    expect(comment).not.toBeNull();
  });

  it('deletes a comment when the caller is the owner', async () => {
    const user = await createTestUser();
    const post = await createTestPost(user.id);

    const createRes = singleResult(
      await server.executeOperation(
        { query: CREATE_COMMENT, variables: { postId: post.id, body: 'To be deleted' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );
    const commentId = (createRes.data?.createComment as { comment: { id: string } }).comment.id;

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: DELETE_COMMENT, variables: { postId: post.id, commentId } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.deleteComment).toMatchObject({ code: 200, success: true });
    expect(await Comment.findById(commentId)).toBeNull();
  });
});
