import type RegisterRequest from '@/dtos/register-request.dto';
import type RegisterResponse from '@/dtos/register-response.dto';

export interface IAuthService {
  register(request: RegisterRequest): Promise<RegisterResponse>;
}
