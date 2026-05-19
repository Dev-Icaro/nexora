import type UserDto from './user.dto';

type UpdateAvatarResponseDto = {
  code: number;
  message: string;
  success: boolean;
  user?: UserDto;
};

export default UpdateAvatarResponseDto;
