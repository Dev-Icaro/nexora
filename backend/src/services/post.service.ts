import mongoose from 'mongoose';

import settings from '@/config/settings';
import type { CreatePostDto, GetPostUploadUrlDto, PostConnectionDto, PostDto } from '@/dtos/post';
import type { PaginationParams, UploadUrlDto } from '@/dtos/shared';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import { Comment } from '@/models/comment.model';
import { Like } from '@/models/like.model';
import { MediaUpload } from '@/models/media-upload.model';
import { Post, type PostDocument } from '@/models/post.model';
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

  async getAll(): Promise<PostDto[]> {
    const posts = await Post.find();
    return posts.map(post => this.toDto(post));
  }

  async getById(postId: string): Promise<PostDto | null> {
    const post = await Post.findById(postId);
    if (!post) return null;
    return this.toDto(post);
  }

  async getFeed({ first = 10, after }: PaginationParams): Promise<PostConnectionDto> {
    return this.paginatePosts({ first, after });
  }

  async getByUserId(userId: string, { first = 10, after }: PaginationParams): Promise<PostConnectionDto> {
    return this.paginatePosts({ first, after }, { user: userId });
  }

  async getUploadUrl({ userId, filename, contentType, fileSizeBytes }: GetPostUploadUrlDto): Promise<UploadUrlDto> {
    if (!allowedContentTypes.has(contentType)) {
      throw new BadRequestException(`Unsupported content type: ${contentType}`);
    }

    const maxFileSizeBytes = getFileSizeLimit(contentType);
    if (fileSizeBytes > maxFileSizeBytes) {
      throw new BadRequestException('File size exceeds the maximum allowed size for this file type');
    }

    const user = await this.userService.getById(userId);
    if (!user) throw new NotFoundException('User not found');

    const storageUsed = user.storageUsedBytes ?? 0;
    const storageQuota = settings.STORAGE_QUOTA_FREE_BYTES;

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
    });

    return { uploadUrl: url, fields: JSON.stringify(fields), objectKey };
  }

  async create({ userId, body, objectKey }: CreatePostDto): Promise<PostDto> {
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

    const user = await this.userService.getById(userId);
    if (!user) throw new NotFoundException('User not found');

    const session = await mongoose.connection.startSession();
    let post: PostDocument;
    try {
      session.startTransaction();

      post = new Post({ body, mediaKey: confirmedKey, username: user.username, user: userId });
      await post.save({ session });

      await User.findByIdAndUpdate(userId, { $inc: { postCount: 1 } }, { session });

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

    return this.toDto(post);
  }

  async delete(userId: string, postId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.user?.toString() !== userId) throw new ForbiddenException('Action not allowed');

    const mediaUpload = post.mediaKey ? await MediaUpload.findOne({ entityId: postId, status: 'confirmed' }) : null;

    await Post.deleteOne({ _id: postId });
    await Promise.all([
      Comment.deleteMany({ postId }),
      Like.deleteMany({ postId }),
      User.findByIdAndUpdate(userId, { $inc: { postCount: -1 } }),
    ]);

    if (mediaUpload) {
      const fileKey = mediaUpload.confirmedUrl ?? mediaUpload.objectKey;
      await Promise.all([
        MediaUpload.deleteOne({ _id: mediaUpload._id }),
        this.storageProvider.deleteFile(fileKey),
        User.findByIdAndUpdate(userId, { $inc: { storageUsedBytes: -(mediaUpload.sizeBytes ?? 0) } }),
      ]);
    }
  }

  async toggleLike(userId: string, postId: string): Promise<PostDto> {
    const user = await this.userService.getById(userId);
    if (!user) throw new NotFoundException('User not found');

    const existing = await Post.findById(postId);
    if (!existing) throw new NotFoundException('Post not found');

    const alreadyLiked = await Like.findOne({ postId, userId });

    let post;
    if (alreadyLiked) {
      await Like.deleteOne({ _id: alreadyLiked._id });
      post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { returnDocument: 'after' });
    } else {
      await Like.create({ postId, userId, username: user.username });
      post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { returnDocument: 'after' });
    }

    if (!post) throw new NotFoundException('Post not found');

    return this.toDto(post);
  }

  private toDto(doc: PostDocument): PostDto {
    return {
      id: doc._id.toString(),
      body: doc.body ?? '',
      mediaUrl: doc.mediaUrl,
      mediaKey: doc.mediaKey,
      authorId: String(doc.user),
      createdAt: doc.createdAt.toISOString(),
      likeCount: doc.likeCount ?? 0,
      commentCount: doc.commentCount ?? 0,
    };
  }

  private async paginatePosts(
    { first, after }: PaginationParams,
    filter: Record<string, unknown> = {},
  ): Promise<PostConnectionDto> {
    const query = { ...filter };

    if (after) {
      const cursorId = decodeCursor(after);
      if (cursorId) query._id = { $lt: cursorId };
    }

    const docs = await Post.find(query)
      .sort({ _id: -1 })
      .limit(first + 1);
    const hasNextPage = docs.length > first;
    const nodes = hasNextPage ? docs.slice(0, first) : docs;

    const edges = nodes.map(post => ({
      node: this.toDto(post),
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
}
