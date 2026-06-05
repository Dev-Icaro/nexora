import mongoose from 'mongoose';

import type { PaginationParams } from '@/dtos/shared/pagination';
import type { UserConnectionDto, UserDto } from '@/dtos/user';
import { BadRequestException, NotFoundException } from '@/exceptions';
import { Follow } from '@/models/follow.model';
import { User, type UserDocument } from '@/models/user.model';
import { decodeCursor, encodeCursor } from '@/utils/pagination';

import type { IFollowService } from './interfaces/follow.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class FollowService implements IFollowService {
  constructor(private readonly userService: IUserService) {}

  private toUserDto(doc: UserDocument): UserDto {
    return {
      id: doc._id.toString(),
      email: doc.email,
      username: doc.username,
      createdAt: doc.createdAt.toISOString(),
      bio: doc.bio,
      position: doc.position,
      themePreference: doc.themePreference,
      avatarKey: doc.avatarKey,
      storageUsedBytes: doc.storageUsedBytes ?? 0,
      storageQuotaBytes: doc.storageQuotaBytes,
      followersCount: doc.followersCount ?? 0,
      followingCount: doc.followingCount ?? 0,
      postCount: doc.postCount ?? 0,
    };
  }

  private async paginateFollows(
    filter: Record<string, unknown>,
    userIdField: 'followerId' | 'followingId',
    { first, after }: PaginationParams,
  ): Promise<UserConnectionDto> {
    const query: Record<string, unknown> = { ...filter };
    if (after) {
      const cursorId = decodeCursor(after);
      if (cursorId) query._id = { $lt: cursorId };
    }

    const docs = await Follow.find(query)
      .sort({ _id: -1 })
      .limit(first + 1);
    const hasNextPage = docs.length > first;
    const page = hasNextPage ? docs.slice(0, first) : docs;

    const userIds = page.map(doc => doc[userIdField]);
    const userDocs = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(userDocs.map(u => [u._id.toString(), u]));

    const edges = page.map(doc => ({
      cursor: encodeCursor(doc._id.toString()),
      node: this.toUserDto(userMap.get(doc[userIdField].toString())!),
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

  async getFollowers(userId: string, params: PaginationParams): Promise<UserConnectionDto> {
    return this.paginateFollows({ followingId: userId }, 'followerId', params);
  }

  async getFollowings(userId: string, params: PaginationParams): Promise<UserConnectionDto> {
    return this.paginateFollows({ followerId: userId }, 'followingId', params);
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const followingUser = await this.userService.getById(followingId);
    if (!followingUser) throw new NotFoundException('User not found');

    const existing = await Follow.findOne({ followerId, followingId });
    if (existing) return;

    const session = await mongoose.connection.startSession();
    try {
      session.startTransaction();
      await Follow.create([{ followerId, followingId }], { session });
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }, { session });
      await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } }, { session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const existing = await Follow.findOne({ followerId, followingId });
    if (!existing) return;

    const session = await mongoose.connection.startSession();
    try {
      session.startTransaction();
      await Follow.deleteOne({ _id: existing._id }, { session });
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } }, { session });
      await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } }, { session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
