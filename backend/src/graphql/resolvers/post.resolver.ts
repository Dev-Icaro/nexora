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
    feed: (_, { first, after }, { dataSources }) => dataSources.postService.getFeed(first ?? 10, after ?? undefined),
    getUserPosts: (_, { userId, first, after }, { dataSources }) =>
      dataSources.postService.getByUserId(userId, first ?? 10, after ?? undefined),
  },
  Mutation: {
    getUploadUrl: (_, { request }, { dataSources, currentUser }) =>
      dataSources.postService.getUploadUrl(
        currentUser!.userId,
        request.filename,
        request.contentType,
        request.fileSizeBytes,
      ),

    createPost: async (_, { body, objectKey }, { dataSources, currentUser }) => {
      const result = await dataSources.postService.create(currentUser!.userId, body, objectKey ?? undefined);
      if (result.success && result.post) {
        pubsub
          .publish(TOPICS.NEW_POST, { newPost: result.post })
          .catch(err => logger.error('Failed to publish newPost event', err));
      }
      return result;
    },

    deletePost: (_, { postId }, { dataSources, currentUser }) =>
      dataSources.postService.delete(currentUser!.userId, postId),

    likePost: (_, { postId }, { dataSources, currentUser }) =>
      dataSources.postService.toggleLike(currentUser!.userId, postId),

    createComment: (_, { postId, body }, { dataSources, currentUser }) =>
      dataSources.commentService.create(currentUser!.userId, postId, body),

    deleteComment: (_, { postId, commentId }, { dataSources, currentUser }) =>
      dataSources.commentService.delete(currentUser!.userId, postId, commentId),
  },
  Post: {
    author: (parent, _, { loaders }) => loadAuthor(parent.authorId, loaders),
    comments: (parent, _, { loaders }) => loaders.commentsLoader.load(parent.id),
    likes: (parent, _, { loaders }) => loaders.likesLoader.load(parent.id),
    likeCount: parent => parent.likeCount,
    commentCount: parent => parent.commentCount,
    mediaUrl: async parent => {
      if (parent.mediaKey) return signMediaUrl(parent.mediaKey);
      return parent.mediaUrl ?? null;
    },
  },
  Comment: {
    author: (parent, _, { loaders }) => loadAuthor(parent.authorId, loaders),
  },
  Like: {
    author: (parent, _, { loaders }) => loadAuthor(parent.authorId, loaders),
  },
};
