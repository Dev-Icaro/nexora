import mongoose from 'mongoose';

import settings from '@/config/settings';
import type { CreateUserDto } from '@/dtos/auth';
import type { UploadUrlDto } from '@/dtos/shared';
import type { GetAvatarUploadUrlDto, UpdateProfileDto, UpdateThemePreferenceDto, UserDto } from '@/dtos/user';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import { MediaUpload } from '@/models/media-upload.model';
import { User, type UserDocument } from '@/models/user.model';
import logger from '@/utils/logger';
import { getFileSizeLimit, MAGIC_BYTES_HEADER_LENGTH, validateMagicBytes } from '@/utils/magic-bytes';
import { withRetry } from '@/utils/retry';
import StorageKeyGenerator from '@/utils/storage-key-generator';

import type { IStorageProvider } from './interfaces/storage-provider.interface';
import type { IUserService } from './interfaces/user.service.interface';

const avatarAllowedTypes = new Set(settings.AVATAR_POST_ALLOWED_CONTENT_TYPES);

export class UserService implements IUserService {
  constructor(private readonly storageProvider: IStorageProvider) {}

  private toUserDto(doc: UserDocument): UserDto {
    return {
      id: doc._id.toString(),
      email: doc.email,
      username: doc.username,
      createdAt: doc.createdAt,
      bio: doc.bio,
      position: doc.position,
      themePreference: doc.themePreference,
      avatarKey: doc.avatarKey,
      storageUsedBytes: doc.storageUsedBytes ?? 0,
      storageQuotaBytes: doc.storageQuotaBytes ?? settings.STORAGE_QUOTA_FREE_BYTES,
      followersCount: doc.followersCount ?? 0,
      followingCount: doc.followingCount ?? 0,
      postCount: doc.postCount ?? 0,
    };
  }

  async getById(userId: string): Promise<UserDto | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    return this.toUserDto(user);
  }

  async getByEmail(email: string): Promise<UserDto | null> {
    const user = await User.findOne({ email });
    if (!user) return null;
    return this.toUserDto(user);
  }

  async getByOAuthAccount(provider: string, providerId: string): Promise<UserDto | null> {
    const user = await User.findOne({
      oauthAccounts: { $elemMatch: { provider, providerId } },
    });
    if (!user) return null;
    return this.toUserDto(user);
  }

  async create(userData: CreateUserDto): Promise<UserDto> {
    const createdAt = new Date().toISOString();
    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      emailVerified: userData.emailVerified ?? false,
      createdAt,
      storageQuotaBytes: settings.STORAGE_QUOTA_FREE_BYTES,
      ...(userData.provider && userData.providerId
        ? { oauthAccounts: [{ provider: userData.provider, providerId: userData.providerId }] }
        : {}),
    });
    return this.toUserDto(user);
  }

  async linkOAuthAccount(userId: string, provider: string, providerId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { emailVerified: true },
      $addToSet: { oauthAccounts: { provider, providerId } },
    });
  }

  async updateThemePreference({ userId, theme }: UpdateThemePreferenceDto): Promise<UserDto> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { themePreference: theme } },
      { returnDocument: 'after' },
    );
    if (!user) throw new NotFoundException('User not found');
    return this.toUserDto(user);
  }

  async updateProfile({ userId, bio, position, objectKey }: UpdateProfileDto): Promise<UserDto> {
    if (bio !== undefined && bio.length > 160) {
      throw new BadRequestException('Bio must not exceed 160 characters');
    }

    const profileUpdates: Record<string, unknown> = {};
    if (bio !== undefined) profileUpdates.bio = bio;
    if (position !== undefined) profileUpdates.position = position;

    let updatedUser: UserDocument;

    if (objectKey) {
      const avatar = await this.prepareAvatarConfirmation(userId, objectKey);

      const session = await mongoose.connection.startSession();
      try {
        session.startTransaction();

        updatedUser = (await User.findByIdAndUpdate(
          userId,
          {
            $set: { ...profileUpdates, avatarKey: avatar.confirmedKey },
            $inc: { storageUsedBytes: avatar.contentLength - avatar.oldSizeBytes, uploadCount: 1 },
          },
          { returnDocument: 'after', session },
        ))!;

        await MediaUpload.create(
          [
            {
              userId,
              entityType: 'avatar',
              entityId: userId,
              status: 'confirmed',
              objectKey: avatar.confirmedKey,
              confirmedUrl: avatar.confirmedKey,
              mimeType: avatar.contentType,
              sizeBytes: avatar.contentLength,
              createdAt: new Date(),
            },
          ],
          { session },
        );

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

      if (avatar.oldAvatarKey) {
        this.storageProvider.deleteFile(avatar.oldAvatarKey).catch(error => {
          logger.error('Failed to delete old avatar from S3 — orphaned object will remain', error);
        });
      }
    } else {
      const user = await User.findByIdAndUpdate(userId, { $set: profileUpdates }, { returnDocument: 'after' });
      if (!user) throw new NotFoundException('User not found');
      updatedUser = user;
    }

    return this.toUserDto(updatedUser);
  }

  private async prepareAvatarConfirmation(
    userId: string,
    objectKey: string,
  ): Promise<{
    confirmedKey: string;
    contentType: string;
    contentLength: number;
    oldSizeBytes: number;
    oldAvatarKey: string | undefined;
  }> {
    if (!objectKey.includes(`/${userId}/`)) {
      throw new ForbiddenException('Object key does not belong to the authenticated user');
    }

    const {
      body: headerBytes,
      contentType,
      contentLength,
    } = await withRetry(() => this.storageProvider.getObjectRange(objectKey, 0, MAGIC_BYTES_HEADER_LENGTH - 1));

    if (!avatarAllowedTypes.has(contentType)) {
      throw new BadRequestException(`Unsupported content type for avatar: ${contentType}`);
    }

    validateMagicBytes(contentType, headerBytes);

    if (contentLength > getFileSizeLimit(contentType)) {
      throw new BadRequestException('Uploaded file exceeds the maximum allowed size');
    }

    const confirmedKey = StorageKeyGenerator.generateConfirmedAvatarKey(userId, objectKey);
    const existingUser = await User.findById(userId);
    if (!existingUser) throw new NotFoundException('User not found');

    let oldSizeBytes = 0;
    const oldAvatarKey = existingUser.avatarKey;
    if (oldAvatarKey) {
      const oldMediaUpload = await MediaUpload.findOne({ objectKey: oldAvatarKey, status: 'confirmed' });
      oldSizeBytes = oldMediaUpload?.sizeBytes ?? 0;
      await MediaUpload.deleteOne({ objectKey: oldAvatarKey });
    }

    await withRetry(() => this.storageProvider.moveFile(objectKey, confirmedKey));
    return { confirmedKey, contentType, contentLength, oldSizeBytes, oldAvatarKey };
  }

  async getAvatarUploadUrl({
    userId,
    filename,
    contentType,
    fileSizeBytes,
  }: GetAvatarUploadUrlDto): Promise<UploadUrlDto> {
    if (!avatarAllowedTypes.has(contentType)) {
      throw new BadRequestException(`Unsupported content type for avatar: ${contentType}`);
    }

    const maxFileSizeBytes = getFileSizeLimit(contentType);
    if (fileSizeBytes > maxFileSizeBytes) {
      throw new BadRequestException('File size exceeds the maximum allowed size for avatars');
    }

    const user = await User.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const storageUsed = user.storageUsedBytes ?? 0;
    const storageQuota = settings.STORAGE_QUOTA_FREE_BYTES;

    if (storageUsed + fileSizeBytes > storageQuota) {
      throw new BadRequestException('Storage quota exceeded');
    }

    const objectKey = StorageKeyGenerator.generatePendingAvatarKey(userId, filename);

    const { url, fields } = await withRetry(() =>
      this.storageProvider.getPresignedUploadUrl(objectKey, {
        contentType,
        maxFileSizeBytes,
        expiresIn: settings.PRESIGNED_UPLOAD_URL_EXPIRY_SECONDS,
      }),
    );

    await MediaUpload.create({
      userId,
      entityType: 'avatar',
      entityId: null,
      status: 'pending',
      objectKey,
      confirmedUrl: null,
      mimeType: contentType,
      sizeBytes: 0,
      createdAt: new Date(),
    });

    return { uploadUrl: url, fields: JSON.stringify(fields), objectKey };
  }
}
