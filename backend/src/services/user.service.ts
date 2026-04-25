import type CreateUserDto from '@/dtos/create-user.dto';
import type UpdateProfileRequestDto from '@/dtos/update-profile-request.dto';
import type UpdateProfileResponseDto from '@/dtos/update-profile-response.dto';
import type UpdateThemePreferenceRequestDto from '@/dtos/update-theme-preference-request.dto';
import type UpdateThemePreferenceResponseDto from '@/dtos/update-theme-preference-response.dto';
import type UserDto from '@/dtos/user.dto';
import { BadRequestException, NotFoundException } from '@/exceptions';
import { User } from '@/models/user.model';

import type { IUserService } from './interfaces/user.service.interface';

export class UserService implements IUserService {
  async findById(userId: string): Promise<UserDto | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    return {
      id: user.id as string,
      email: user.email,
      username: user.username,
      password: user.password ?? undefined,
      createdAt: user.createdAt,
      bio: user.bio ?? undefined,
      position: user.position ?? undefined,
    };
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await User.findOne({ email });
    if (!user) return null;
    return {
      id: user.id as string,
      email: user.email,
      username: user.username,
      password: user.password ?? undefined,
      createdAt: user.createdAt,
      bio: user.bio ?? undefined,
      position: user.position ?? undefined,
    };
  }

  async saveRefreshTokenHash(userId: string, hash: string, expiresAt: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: { tokens: { refreshTokenHash: hash, expiresAt } },
    });
  }

  async findByRefreshTokenHash(hash: string): Promise<UserDto | null> {
    const user = await User.findOne({
      tokens: { $elemMatch: { refreshTokenHash: hash, expiresAt: { $gt: new Date() } } },
    });
    if (!user) return null;
    return {
      id: user.id as string,
      email: user.email,
      username: user.username,
      password: user.password ?? undefined,
      createdAt: user.createdAt,
      bio: user.bio ?? undefined,
      position: user.position ?? undefined,
    };
  }

  async removeRefreshTokenHash(userId: string, hash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { tokens: { refreshTokenHash: hash } },
    });
  }

  async findByOAuthAccount(provider: string, providerId: string): Promise<UserDto | null> {
    const user = await User.findOne({
      oauthAccounts: { $elemMatch: { provider, providerId } },
    });
    if (!user) return null;
    return {
      id: user.id as string,
      email: user.email,
      username: user.username,
      password: user.password ?? undefined,
      createdAt: user.createdAt,
      bio: user.bio ?? undefined,
      position: user.position ?? undefined,
    };
  }

  async create(userData: CreateUserDto): Promise<UserDto> {
    const createdAt = new Date().toISOString();
    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      createdAt,
      ...(userData.provider && userData.providerId
        ? { oauthAccounts: [{ provider: userData.provider, providerId: userData.providerId }] }
        : {}),
    });
    return {
      id: user.id as string,
      email: user.email,
      username: user.username,
      createdAt,
    };
  }

  async linkOAuthAccount(userId: string, provider: string, providerId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { oauthAccounts: { provider, providerId } },
    });
  }

  async updateThemePreference(
    userId: string,
    { theme }: UpdateThemePreferenceRequestDto,
  ): Promise<UpdateThemePreferenceResponseDto> {
    const user = await User.findByIdAndUpdate(userId, { $set: { themePreference: theme } }, { new: true });
    if (!user) throw new NotFoundException('User not found');

    return {
      code: 200,
      message: 'Theme preference updated',
      success: true,
      user: {
        id: user.id as string,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        bio: user.bio ?? undefined,
        position: user.position ?? undefined,
        themePreference: (user.themePreference as 'light' | 'dark' | 'system') ?? 'system',
      },
    };
  }

  async updateProfile(userId: string, { bio, position }: UpdateProfileRequestDto): Promise<UpdateProfileResponseDto> {
    if (bio !== undefined && bio.length > 160) {
      throw new BadRequestException('Bio must not exceed 160 characters');
    }

    const updates: Record<string, string> = {};
    if (bio !== undefined) updates.bio = bio;
    if (position !== undefined) updates.position = position;

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
    if (!user) throw new NotFoundException('User not found');

    return {
      code: 200,
      message: 'Profile updated successfully',
      success: true,
      user: {
        id: user.id as string,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        bio: user.bio ?? undefined,
        position: user.position ?? undefined,
      },
    };
  }
}
