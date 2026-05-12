type UserDto = {
  id: string;
  email: string;
  username: string;
  password?: string;
  createdAt: string;
  bio?: string;
  position?: string;
  themePreference?: string;
  storageUsedBytes?: number;
  storageQuotaBytes?: number;
};

export default UserDto;
