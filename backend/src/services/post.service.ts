import mongoose from 'mongoose';

import settings from '@/config/settings';
import type CreatePostResponse from '@/dtos/create-post-response.dto';
import type DeletePostResponse from '@/dtos/delete-post-response.dto';
import type GetUploadUrlResponse from '@/dtos/get-upload-url-response.dto';
import type LikePostResponse from '@/dtos/like-post-response.dto';
import type PostDto from '@/dtos/post.dto';
import type PostConnectionDto from '@/dtos/post-connection.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import { Comment } from '@/models/comment.model';
import { Like } from '@/models/like.model';
import { MediaUpload } from '@/models/media-upload.model';
import { Post } from '@/models/post.model';
import { User } from '@/models/user.model';
import { getFileSizeLimit, MAGIC_BYTES_HEADER_LENGTH, validateMagicBytes } from '@/utils/magic-bytes';
import { decodeCursor, encodeCursor } from '@/utils/pagination';
import { withRetry } from '@/utils/retry';
import StorageKeyGenerator from '@/utils/storage-key-generator';

import type { IPostService } from './interfaces/post.service.interface';
import type { IStorageProvider } from './interfaces/storage-provider.interface';
import type { IUserService } from './interfaces/user.service.interface';

const allowedContentTypes = new Set(settings.POST_ALLOWED_CONTENT_TYPES);

export class PostService implements IPostService {
  constructor(
    private readonly userService: IUserService,
    private readonly storageProvider: IStorageProvider,
  ) {}

  async getUploadUrl(
    userId: string,
    filename: string,
    contentType: string,
    fileSizeBytes: number,
  ): Promise<GetUploadUrlResponse> {
    if (!allowedContentTypes.has(contentType)) {
      throw new BadRequestException(`Unsupported content type: ${contentType}`);
    }

    const maxFileSizeBytes = getFileSizeLimit(contentType);
    if (fileSizeBytes > maxFileSizeBytes) {
      throw new BadRequestException('File size exceeds the maximum allowed size for this file type');
    }

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const storageUsed = user.storageUsedBytes ?? 0;
    const storageQuota = user.storageQuotaBytes ?? settings.STORAGE_QUOTA_FREE_BYTES;

    if (storageUsed + fileSizeBytes > storageQuota) {
      throw new BadRequestException('Storage quota exceeded');
    }

    const objectKey = StorageKeyGenerator.generatePendingPostKey(userId, filename);

    const { url, fields } = await withRetry(() =>
      this.storageProvider.getPresignedUploadUrl(objectKey, {
        contentType,
        maxFileSizeBytes,
        expiresIn: settings.PRESIGNED_UPLOAD_URL_EXPIRY_SECONDS,
      }),
    );

    await MediaUpload.create({
      userId,
      entityType: 'post',
      entityId: null,
      status: 'pending',
      objectKey,
      confirmedUrl: null,
      mimeType: contentType,
      sizeBytes: 0,
      createdAt: new Date(),
    });

    return {
      code: 200,
      success: true,
      message: 'Upload URL generated',
      uploadUrl: url,
      fields: JSON.stringify(fields),
      objectKey,
    };
  }

  async createPost(userId: string, body: string, objectKey?: string): Promise<CreatePostResponse> {
    let confirmedKey: string | undefined;
    let mediaContentLength = 0;

    if (objectKey) {
      if (!objectKey.includes(`/${userId}/`)) {
        throw new ForbiddenException('Object key does not belong to the authenticated user');
      }

      const {
        body: headerBytes,
        contentType,
        contentLength,
      } = await withRetry(() => this.storageProvider.getObjectRange(objectKey, 0, MAGIC_BYTES_HEADER_LENGTH - 1));

      // Validate content type and magic bytes from actual S3 bytes — never from client-supplied data
      validateMagicBytes(contentType, headerBytes);

      const sizeLimit = getFileSizeLimit(contentType);
      if (contentLength > sizeLimit) {
        throw new BadRequestException('Uploaded file exceeds the maximum allowed size');
      }

      confirmedKey = objectKey.replace('pending/posts/', 'confirmed/posts/');
      mediaContentLength = contentLength;
      await withRetry(() => this.storageProvider.moveFile(objectKey, confirmedKey!));
    }

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const createdAt = new Date().toISOString();
    const session = await mongoose.connection.startSession();
    let post: InstanceType<typeof Post>;
    try {
      session.startTransaction();

      post = new Post({ body, mediaKey: confirmedKey, username: user.username, user: userId, createdAt });
      await post.save({ session });

      if (confirmedKey && objectKey) {
        await MediaUpload.findOneAndUpdate(
          { objectKey, status: 'pending', userId },
          {
            status: 'confirmed',
            entityId: post._id,
            objectKey: confirmedKey,
            confirmedUrl: confirmedKey,
            sizeBytes: mediaContentLength,
          },
          { session },
        );
        await User.findByIdAndUpdate(
          userId,
          { $inc: { storageUsedBytes: mediaContentLength, uploadCount: 1 } },
          { session },
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return {
      code: 201,
      success: true,
      message: 'Post created successfully',
      post: {
        id: post.id as string,
        body: post.body ?? '',
        mediaKey: post.mediaKey ?? undefined,
        authorId: String(post.user ?? userId),
        createdAt: post.createdAt ?? createdAt,
        likeCount: 0,
        commentCount: 0,
      },
    };
  }

  async deletePost(userId: string, postId: string): Promise<DeletePostResponse> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.user?.toString() !== userId) throw new ForbiddenException('Action not allowed');

    const mediaUpload = post.mediaKey ? await MediaUpload.findOne({ entityId: postId, status: 'confirmed' }) : null;

    await Post.deleteOne({ _id: postId });
    await Promise.all([Comment.deleteMany({ postId }), Like.deleteMany({ postId })]);

    if (mediaUpload) {
      const fileKey = mediaUpload.confirmedUrl ?? mediaUpload.objectKey;
      await Promise.all([
        MediaUpload.deleteOne({ _id: mediaUpload._id }),
        this.storageProvider.deleteFile(fileKey),
        User.findByIdAndUpdate(userId, { $inc: { storageUsedBytes: -(mediaUpload.sizeBytes ?? 0) } }),
      ]);
    }

    return { code: 200, success: true, message: 'Post deleted successfully' };
  }

  async getPostById(postId: string): Promise<PostDto | null> {
    const post = await Post.findById(postId);
    if (!post) return null;
    return {
      id: post.id as string,
      body: post.body ?? '',
      mediaUrl: post.mediaUrl ?? undefined,
      mediaKey: post.mediaKey ?? undefined,
      authorId: String(post.user),
      createdAt: post.createdAt ?? '',
      likeCount: post.likeCount ?? 0,
      commentCount: post.commentCount ?? 0,
    };
  }

  async getFeed(first = 10, after?: string): Promise<PostConnectionDto> {
    const limit = first;
    const query: Record<string, unknown> = {};

    if (after) {
      const cursorId = decodeCursor(after);
      if (cursorId) query._id = { $lt: cursorId };
    }

    const docs = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);
    const hasNextPage = docs.length > limit;
    const nodes = hasNextPage ? docs.slice(0, limit) : docs;

    const edges = nodes.map(post => ({
      node: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        mediaKey: post.mediaKey ?? undefined,
        authorId: String(post.user),
        createdAt: post.createdAt ?? '',
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
      },
      cursor: encodeCursor(post._id.toString()),
    }));

    return {
      edges,
      pageInfo: {
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
        hasNextPage,
        hasPreviousPage: !!after,
      },
    };
  }

  async getUserPosts(userId: string, first = 10, after?: string): Promise<PostConnectionDto> {
    const limit = first;
    const query: Record<string, unknown> = { user: userId };

    if (after) {
      const cursorId = decodeCursor(after);
      if (cursorId) query._id = { $lt: cursorId };
    }

    const docs = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);
    const hasNextPage = docs.length > limit;
    const nodes = hasNextPage ? docs.slice(0, limit) : docs;

    const edges = nodes.map(post => ({
      node: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        mediaKey: post.mediaKey ?? undefined,
        authorId: String(post.user),
        createdAt: post.createdAt ?? '',
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
      },
      cursor: encodeCursor(post._id.toString()),
    }));

    return {
      edges,
      pageInfo: {
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
        hasNextPage,
        hasPreviousPage: !!after,
      },
    };
  }

  async likePost(userId: string, postId: string): Promise<LikePostResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const existing = await Post.findById(postId);
    if (!existing) throw new NotFoundException('Post not found');

    const alreadyLiked = await Like.findOne({ postId, userId });

    let post;
    if (alreadyLiked) {
      await Like.deleteOne({ _id: alreadyLiked._id });
      post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { new: true });
    } else {
      await Like.create({ postId, userId, username: user.username, createdAt: new Date().toISOString() });
      post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { new: true });
    }

    if (!post) throw new NotFoundException('Post not found');

    return {
      code: 200,
      success: true,
      message: alreadyLiked ? 'Post unliked successfully' : 'Post liked successfully',
      post: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        mediaKey: post.mediaKey ?? undefined,
        authorId: String(post.user),
        createdAt: post.createdAt ?? '',
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
      },
    };
  }
}
