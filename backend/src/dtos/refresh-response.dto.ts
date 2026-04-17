import type { ApiResponse } from '@/types/api-reponse';

type RefreshResponse = ApiResponse & {
  accessToken?: string;
};

export default RefreshResponse;
