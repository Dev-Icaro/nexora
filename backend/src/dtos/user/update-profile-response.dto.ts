import type UserDto from './user.dto';

type UpdateProfileResponseDto = {
  code: number;
  message: string;
  success: boolean;
  user?: UserDto;
};

export default UpdateProfileResponseDto;
