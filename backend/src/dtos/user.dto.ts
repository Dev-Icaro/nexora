type UserDto = {
  id: string;
  email: string;
  username: string;
  password?: string;
  createdAt: string;
  bio?: string;
  position?: string;
  themePreference?: string;
};

export default UserDto;
