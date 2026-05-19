import type UserDto from './user.dto';

type UpdateThemePreferenceResponseDto = {
  code: number;
  message: string;
  success: boolean;
  user?: UserDto;
};

export default UpdateThemePreferenceResponseDto;
