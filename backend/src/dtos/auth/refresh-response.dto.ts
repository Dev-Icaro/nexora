import type UserDto from '@/dtos/user/user.dto';
import type { ApiResponse } from '@/types/api-reponse';

type RefreshResponse = ApiResponse & {
  accessToken?: string;
  user?: Omit<UserDto, 'password'>;
};

export default RefreshResponse;
