import type UserDto from '@/dtos/user.dto';

export interface IUserService {
  findByEmail(email: string): Promise<UserDto | null>;
  saveRefreshTokenHash(userId: string, hash: string, expiresAt: Date): Promise<void>;
}
