import env from '@/config/environment';
import settings from '@/config/settings';
import type ApplyPasswordResetRequest from '@/dtos/apply-password-reset-request.dto';
import type ApplyPasswordResetResponse from '@/dtos/apply-password-reset-response.dto';
import type LoginRequest from '@/dtos/login-request.dto';
import type LoginResponse from '@/dtos/login-response.dto';
import type LogoutResponse from '@/dtos/logout-response.dto';
import type RefreshResponse from '@/dtos/refresh-response.dto';
import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';
import type RequestPasswordResetResponse from '@/dtos/request-password-reset-response.dto';
import type ValidatePasswordResetTokenResponse from '@/dtos/validate-password-reset-token-response.dto';
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
        id: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
        createdAt,
      },
    };
  }

  async requestPasswordReset(email: string): Promise<RequestPasswordResetResponse> {
    const successResponse = (): RequestPasswordResetResponse => ({
      code: 200,
      success: true,
      message: 'If this email is registered, you will receive a reset link.',
    });

    const user = await this.userService.findByEmail(email);
    if (!user) return successResponse();

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

    return successResponse();
  }

  async applyPasswordReset({
    token,
    newPassword,
    confirmPassword,
  }: ApplyPasswordResetRequest): Promise<ApplyPasswordResetResponse> {
    if (newPassword !== confirmPassword) throw new BadRequestException('Passwords do not match');
    if (newPassword.length < 8) throw new BadRequestException('Password must be at least 8 characters');

    await this.validatePasswordResetToken(token);

    const tokenHash = hashPasswordResetToken(token);
    const record = await PasswordResetToken.findOne({ tokenHash });

    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(record!.userId, { $set: { password: hashedPassword } });
    await PasswordResetToken.findOneAndUpdate({ tokenHash }, { $set: { usedAt: new Date() } });
    await this.userService.clearAllRefreshTokens(record!.userId.toString());

    return { code: 200, success: true, message: 'Password reset successfully' };
  }

  async validatePasswordResetToken(token: string): Promise<ValidatePasswordResetTokenResponse> {
    const tokenHash = hashPasswordResetToken(token);
    const record = await PasswordResetToken.findOne({ tokenHash });

    if (!record) throw new BadRequestException('Invalid or expired reset link');
    if (record.usedAt !== null) throw new BadRequestException('This reset link has already been used');
    if (record.expiresAt <= new Date()) throw new BadRequestException('Invalid or expired reset link');

    return { code: 200, success: true, message: 'Token is valid' };
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
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        avatarKey: user.avatarKey,
      },
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

  async loginWithOAuth(provider: string, oauthUser: OAuthUserInfo): Promise<{ refreshToken: string }> {
    let user = await this.userService.findByOAuthAccount(provider, oauthUser.providerId);

    if (!user) {
      user = await this.userService.findByEmail(oauthUser.email);
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

    const tokenInfo = { userId: user.id };
    const refreshToken = createRefreshToken(tokenInfo);
    const refreshTokenHash = createHashForRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + settings.REFRESH_TOKEN_DURATION_MINUTES * 60 * 1000);

    await this.userService.saveRefreshTokenHash(user.id, refreshTokenHash, expiresAt);

    return { refreshToken };
  }

  async login({ email, password }: LoginRequest): Promise<LoginResponse & { refreshToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await comparePassword(password, user.password ?? '');
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

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
        avatarKey: user.avatarKey,
      },
    };
  }
}
