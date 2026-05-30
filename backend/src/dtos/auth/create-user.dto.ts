type CreateUserDto = {
  username: string;
  email: string;
  password?: string;
  provider?: string;
  providerId?: string;
  emailVerified?: boolean;
};

export default CreateUserDto;
