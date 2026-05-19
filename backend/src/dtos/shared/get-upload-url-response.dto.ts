import type { ApiResponse } from '@/dtos/shared';

type GetUploadUrlResponse = ApiResponse & {
  uploadUrl?: string;
  fields?: string;
  objectKey?: string;
};

export default GetUploadUrlResponse;
