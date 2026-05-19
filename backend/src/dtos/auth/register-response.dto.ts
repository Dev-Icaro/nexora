import { ApiResponse } from '@/dtos/shared';

type RegisterResponse = ApiResponse & {
  user?: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  };
};

export default RegisterResponse;
