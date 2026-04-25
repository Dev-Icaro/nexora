import type UserDto from '@/dtos/user.dto';

type UpdateThemePreferenceResponseDto = {
  code: number;
  message: string;
  success: boolean;
  user?: UserDto;
};

export default UpdateThemePreferenceResponseDto;
