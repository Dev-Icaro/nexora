import type { ApiResponse } from '@/dtos/shared';
import type UserDto from '@/dtos/user/user.dto';

type RefreshResponse = ApiResponse & {
  accessToken?: string;
  user?: Omit<UserDto, 'password'>;
};

export default RefreshResponse;
