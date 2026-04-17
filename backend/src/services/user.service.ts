import type UserDto from '@/dtos/user.dto';
import { User } from '@/models/user.model';

import type { IUserService } from './interfaces/user.service.interface';

export class UserService implements IUserService {
  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await User.findOne({ email });
    if (!user) return null;
    return {
      id: user.id as string,
      email: user.email,
      username: user.username,
      password: user.password,
      createdAt: user.createdAt,
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
      password: user.password,
      createdAt: user.createdAt,
    };
  }

  async removeRefreshTokenHash(userId: string, hash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { tokens: { refreshTokenHash: hash } },
    });
  }
}
