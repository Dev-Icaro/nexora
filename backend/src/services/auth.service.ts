import env from '@/config/environment';
import settings from '@/config/settings';
import type { ApplyPasswordResetDto, LoginDto, RegisterDto, TokenInfoDto } from '@/dtos/auth';
import type UserDto from '@/dtos/user/user.dto';
import { BadRequestException, ConflictException, UnauthorizedException } from '@/exceptions';
import { PasswordResetToken } from '@/models/password-reset-token.model';
import { User } from '@/models/user.model';
import type { OAuthUserInfo } from '@/services/oauth/oauth-provider.interface';
import { createAccessToken, createHashForRefreshToken, createRefreshToken } from '@/utils/auth';
import { comparePassword, generatePasswordResetToken, hashPassword, hashPasswordResetToken } from '@/utils/crypto';

import type { IEmailService } from './email/email.service.interface';
import { buildPasswordResetEmailHtml } from './email/templates/password-reset.template';
import type { IAuthService } from './interfaces/auth.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class AuthService implements IAuthService {
  constructor(
    private readonly userService: IUserService,
    private readonly emailService: IEmailService,
  ) {}

  async register({ username, email, password, confirmPassword }: RegisterDto): Promise<UserDto> {
    if (password !== confirmPassword) throw new BadRequestException('Passwords do not match');

    const existing = await User.findOne({ email });
    if (existing) throw new ConflictException('Email is already registered');

    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();
    const newUser = await User.create({ username, email, password: hashedPassword, createdAt });

    return {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      createdAt,
    };
  }

  async login({ email, password }: LoginDto): Promise<TokenInfoDto> {
    const doc = await User.findOne({ email });
    if (!doc) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await comparePassword(password, doc.password ?? '');
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const userId = doc._id.toString();
    const tokenInfo = { userId };
    const accessToken = createAccessToken(tokenInfo);
    const refreshToken = createRefreshToken(tokenInfo);
    const refreshTokenHash = createHashForRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000);

    await this.userService.saveRefreshTokenHash(userId, refreshTokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: doc.email,
        username: doc.username,
        createdAt: doc.createdAt,
        avatarKey: doc.avatarKey,
      },
    };
  }

  async refresh(incomingRefreshToken: string): Promise<TokenInfoDto> {
    const hash = createHashForRefreshToken(incomingRefreshToken);
    const user = await this.userService.getByRefreshTokenHash(hash);
    if (!user) throw new UnauthorizedException('Unauthorized');

    await this.userService.removeRefreshTokenHash(user.id, hash);

    const tokenInfo = { userId: user.id };
    const accessToken = createAccessToken(tokenInfo);
    const refreshToken = createRefreshToken(tokenInfo);
    const refreshTokenHash = createHashForRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000);

    await this.userService.saveRefreshTokenHash(user.id, refreshTokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        avatarKey: user.avatarKey,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = createHashForRefreshToken(refreshToken);
    const user = await this.userService.getByRefreshTokenHash(hash);
    if (user) {
      await this.userService.removeRefreshTokenHash(user.id, hash);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    if (!user) return;

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = new Date(Date.now() + settings.PASSWORD_RESET_TOKEN_DURATION_MINUTES * 60 * 1000);

    await PasswordResetToken.deleteMany({ userId: user.id });
    await PasswordResetToken.create({ userId: user.id, tokenHash, expiresAt });

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    const html = buildPasswordResetEmailHtml({
      userName: user.username,
      resetLink,
      expiresIn: `${settings.PASSWORD_RESET_TOKEN_DURATION_MINUTES} minutes`,
      year: new Date().getFullYear().toString(),
      baseUrl: env.FRONTEND_URL,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Reset your Nexora password',
      html,
    });
  }

  async applyPasswordReset({ token, newPassword, confirmPassword }: ApplyPasswordResetDto): Promise<void> {
    if (newPassword !== confirmPassword) throw new BadRequestException('Passwords do not match');
    if (newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters');

    await this.validatePasswordResetToken(token);

    const tokenHash = hashPasswordResetToken(token);
    const record = await PasswordResetToken.findOne({ tokenHash });
    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(record!.userId, { $set: { password: hashedPassword } });
    await PasswordResetToken.findOneAndUpdate({ tokenHash }, { $set: { usedAt: new Date() } });
    await this.userService.clearAllRefreshTokens(record!.userId.toString());
  }

  async validatePasswordResetToken(token: string): Promise<void> {
    const tokenHash = hashPasswordResetToken(token);
    const record = await PasswordResetToken.findOne({ tokenHash });

    if (!record) throw new BadRequestException('Invalid or expired reset link');
    if (record.usedAt !== null) throw new BadRequestException('This reset link has already been used');
    if (record.expiresAt <= new Date()) throw new BadRequestException('Invalid or expired reset link');
  }

  async loginWithOAuth(provider: string, oauthUser: OAuthUserInfo): Promise<Pick<TokenInfoDto, 'refreshToken'>> {
    let user = await this.userService.getByOAuthAccount(provider, oauthUser.providerId);

    if (!user) {
      user = await this.userService.getByEmail(oauthUser.email);
      if (user) {
        await this.userService.linkOAuthAccount(user.id, provider, oauthUser.providerId);
      } else {
        user = await this.userService.create({
          username: oauthUser.name,
          email: oauthUser.email,
          provider,
          providerId: oauthUser.providerId,
        });
      }
    }

    if (!user) throw new UnauthorizedException('Unauthorized');

    const tokenInfo = { userId: user.id };
    const refreshToken = createRefreshToken(tokenInfo);
    const refreshTokenHash = createHashForRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000);

    await this.userService.saveRefreshTokenHash(user.id, refreshTokenHash, expiresAt);

    return { refreshToken };
  }
}
