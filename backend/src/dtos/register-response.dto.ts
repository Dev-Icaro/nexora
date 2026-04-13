import { ApiResponse } from '@/types/api-reponse';

type RegisterResponse = ApiResponse & {
  user?: {
    id: string;
    email: string;
    username: string;
    token: string;
    createdAt: string;
  };
};

export default RegisterResponse;
