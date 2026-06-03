import mongoose from 'mongoose';

import { BadRequestException, NotFoundException } from '@/exceptions';
import { Follow } from '@/models/follow.model';
import { User } from '@/models/user.model';

import type { IFollowService } from './interfaces/follow.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class FollowService implements IFollowService {
  constructor(private readonly userService: IUserService) {}

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
