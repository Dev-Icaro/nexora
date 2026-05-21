import type UserDto from '@/dtos/user/user.dto';

type TokenInfoDto = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export default TokenInfoDto;
