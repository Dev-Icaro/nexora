import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';
import { BadRequestException, ConflictException } from '@/exceptions';
import { User } from '@/models/user.model';
import { hashPassword } from '@/utils/crypto';

import type { IAuthService } from './interfaces/auth.service.interface';

export class AuthService implements IAuthService {
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
        token: '', // JWT generation is out of scope — implemented in a future task
        createdAt,
      },
    };
  }
}
