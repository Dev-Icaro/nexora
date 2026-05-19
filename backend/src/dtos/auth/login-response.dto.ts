import type UserDto from '@/dtos/user/user.dto';
import type { ApiResponse } from '@/types/api-reponse';

type LoginResponse = ApiResponse & {
  accessToken?: string;
  user?: Omit<UserDto, 'password'>;
};

export default LoginResponse;
