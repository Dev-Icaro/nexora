import type LoginRequest from '@/dtos/login-request.dto';
import type LoginResponse from '@/dtos/login-response.dto';
import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';

export interface IAuthService {
  register(request: RegisterRequest): Promise<RegisterResponse>;
  login(request: LoginRequest): Promise<LoginResponse & { refreshToken: string }>;
}
