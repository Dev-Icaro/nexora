import type { ApiResponse } from '@/types/api-reponse';

type GetUploadUrlResponse = ApiResponse & {
  uploadUrl?: string;
  fields?: string;
  objectKey?: string;
};

export default GetUploadUrlResponse;
