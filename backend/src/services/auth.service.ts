import settings from '@/config/settings';
import type LoginRequest from '@/dtos/login-request.dto';
import type LoginResponse from '@/dtos/login-response.dto';
import type LogoutResponse from '@/dtos/logout-response.dto';
import type RefreshResponse from '@/dtos/refresh-response.dto';
import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';
import { BadRequestException, ConflictException, UnauthorizedException } from '@/exceptions';
import { User } from '@/models/user.model';
import { createAccessToken, createHashForRefreshToken, createRefreshToken } from '@/utils/auth';
import { comparePassword, hashPassword } from '@/utils/crypto';

import type { IAuthService } from './interfaces/auth.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class AuthService implements IAuthService {
  constructor(private readonly userService: IUserService) {}

  async register({ username, email, password, confirmPassword }: RegisterRequest): Promise<RegisterResponse> {
    if (password !== confirmPassword) throw new BadRequestException('Passwords do not match');

    const existing = await User.findOne({ email });
    if (existing) throw new ConflictException('Email is already registered');

    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    const newUser = await User.create({ username, email, password: hashedPassword, createdAt });

    return {
      code: 201,
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id as string,
        email: newUser.email ?? '',
        username: newUser.username ?? '',
        createdAt,
      },
    };
  }

  async refresh(incomingRefreshToken: string): Promise<RefreshResponse & { refreshToken: string }> {
    const hash = createHashForRefreshToken(incomingRefreshToken);
    const user = await this.userService.findByRefreshTokenHash(hash);
    if (!user) throw new UnauthorizedException('Unauthorized');

    await this.userService.removeRefreshTokenHash(user.id, hash);

    const tokenInfo = { userId: user.id };
    const accessToken = createAccessToken(tokenInfo);
    const refreshToken = createRefreshToken(tokenInfo);
    const refreshTokenHash = createHashForRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000);

    await this.userService.saveRefreshTokenHash(user.id, refreshTokenHash, expiresAt);

    return {
      code: 200,
      success: true,
      message: 'Token refreshed',
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    const hash = createHashForRefreshToken(refreshToken);
    const user = await this.userService.findByRefreshTokenHash(hash);

    if (user) {
      await this.userService.removeRefreshTokenHash(user.id, hash);
    }

    return { code: 200, success: true, message: 'Logged out successfully' };
  }

  async login({ email, password }: LoginRequest): Promise<LoginResponse & { refreshToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Unauthorized');

    const passwordMatch = await comparePassword(password, user.password ?? '');
    if (!passwordMatch) throw new UnauthorizedException('Unauthorized');

    const tokenInfo = { userId: user.id };
    const accessToken = createAccessToken(tokenInfo);
    const refreshToken = createRefreshToken(tokenInfo);
    const refreshTokenHash = createHashForRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000);

    await this.userService.saveRefreshTokenHash(user.id, refreshTokenHash, expiresAt);

    return {
      code: 200,
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    };
  }
}
