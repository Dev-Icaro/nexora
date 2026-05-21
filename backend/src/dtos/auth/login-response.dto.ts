import type { ApiResponse } from '@/dtos/shared';
import type UserDto from '@/dtos/user/user.dto';

type LoginResponse = ApiResponse & {
  accessToken?: string;
  user?: UserDto;
};

export default LoginResponse;
