type UserDto = {
  id: string;
  email: string;
  username: string;
  password?: string;
  createdAt: string;
  bio?: string;
  position?: string;
  themePreference?: 'light' | 'dark' | 'system';
  avatarKey?: string;
  storageUsedBytes?: number;
  storageQuotaBytes?: number;
};

export default UserDto;
