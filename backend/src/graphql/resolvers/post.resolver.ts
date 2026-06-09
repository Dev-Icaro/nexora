import { InternalServerErrorException } from '@/exceptions';
import type { Resolvers } from '@/graphql/__generated__/types';
import type { Loaders } from '@/graphql/loaders';
import { pubsub, TOPICS } from '@/graphql/pubsub';
import { signMediaUrl } from '@/services/cloud/cloud-front';
import logger from '@/utils/logger';

async function loadAuthor(id: string, loaders: Loaders) {
  const user = await loaders.usersLoader.load(id);
  if (!user) throw new InternalServerErrorException(`Author not found: ${id}`);
  return user;
}

export const postResolver: Resolvers = {
  Query: {
    getPosts: (_, __, { dataSources }) => dataSources.postService.getAll(),
    getPost: (_, { postId }, { dataSources }) => dataSources.postService.getById(postId),
    feed: (_, { first, after }, { dataSources }) =>
      dataSources.postService.getFeed({ first: first ?? 10, after: after ?? undefined }),
    getUserPosts: (_, { userId, first, after }, { dataSources }) =>
      dataSources.postService.getByUserId(userId, { first: first ?? 10, after: after ?? undefined }),
  },
  Mutation: {
    getUploadUrl: async (_, { request }, { dataSources, currentUser }) => {
      const { uploadUrl, fields, objectKey } = await dataSources.postService.getUploadUrl({
        userId: currentUser!.userId,
        ...request,
      });
      return { code: 200, success: true, message: 'Upload URL generated', uploadUrl, fields, objectKey };
    },

    createPost: async (_, { body, objectKey }, { dataSources, currentUser }) => {
      const post = await dataSources.postService.create({
        userId: currentUser!.userId,
        body,
        objectKey: objectKey ?? undefined,
      });
      pubsub
        .publish(TOPICS.NEW_POST, { newPost: post })
        .catch(err => logger.error('Failed to publish newPost event', err));
      return { code: 201, success: true, message: 'Post created successfully', post };
    },

    deletePost: async (_, { postId }, { dataSources, currentUser }) => {
      await dataSources.postService.delete(currentUser!.userId, postId);
      return { code: 200, success: true, message: 'Post deleted successfully' };
    },

    likePost: async (_, { postId }, { dataSources, currentUser }) => {
      const post = await dataSources.postService.toggleLike(currentUser!.userId, postId);
      const liked = post.likeCount > 0;
      return {
        code: 200,
        success: true,
        message: liked ? 'Post liked successfully' : 'Post unliked successfully',
        post,
      };
    },

    createComment: async (_, { postId, body }, { dataSources, currentUser }) => {
      const comment = await dataSources.commentService.create({ userId: currentUser!.userId, postId, body });
      return { code: 201, success: true, message: 'Comment created successfully', comment };
    },

    deleteComment: async (_, { postId, commentId }, { dataSources, currentUser }) => {
      const comment = await dataSources.commentService.delete({ userId: currentUser!.userId, postId, commentId });
      return { code: 200, success: true, message: 'Comment deleted successfully', comment };
    },

    likeComment: async (_, { commentId }, { dataSources, currentUser }) => {
      const comment = await dataSources.commentService.like(currentUser!.userId, commentId);
      return { code: 200, success: true, message: 'Comment liked successfully', comment };
    },

    unlikeComment: async (_, { commentId }, { dataSources, currentUser }) => {
      const comment = await dataSources.commentService.unlike(currentUser!.userId, commentId);
      return { code: 200, success: true, message: 'Comment unliked successfully', comment };
    },

    addBookmark: async (_, { postId }, { dataSources, currentUser }) => {
      await dataSources.bookmarkService.add(currentUser!.userId, postId);
      const post = await dataSources.postService.getById(postId);
      return { code: 200, success: true, message: 'Post bookmarked successfully', post };
    },

    removeBookmark: async (_, { postId }, { dataSources, currentUser }) => {
      await dataSources.bookmarkService.remove(currentUser!.userId, postId);
      const post = await dataSources.postService.getById(postId);
      return { code: 200, success: true, message: 'Post unbookmarked successfully', post };
    },
  },
  Post: {
    author: (parent, _, { loaders }) => loadAuthor(parent.authorId, loaders),
    comments: (parent, _, { loaders }) => loaders.commentsLoader.load(parent.id),
    likes: (parent, _, { loaders }) => loaders.likesLoader.load(parent.id),
    likeCount: parent => parent.likeCount,
    commentCount: parent => parent.commentCount,
    isBookmarked: (parent, _, { loaders }) => loaders.isBookmarkedLoader.load(parent.id),
    mediaUrl: async parent => {
      if (parent.mediaKey) return signMediaUrl(parent.mediaKey);
      return parent.mediaUrl ?? null;
    },
  },
  Comment: {
    author: (parent, _, { loaders }) => loadAuthor(parent.authorId, loaders),
    likeCount: parent => parent.likeCount,
  },
  Like: {
    author: (parent, _, { loaders }) => loadAuthor(parent.authorId, loaders),
  },
};
