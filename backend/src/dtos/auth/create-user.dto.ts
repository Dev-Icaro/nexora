type CreateUserDto = {
  username: string;
  email: string;
  password?: string;
  provider?: string;
  providerId?: string;
};

export default CreateUserDto;
