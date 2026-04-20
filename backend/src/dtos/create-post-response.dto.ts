import type PostDto from '@/dtos/post.dto';
import type { ApiResponse } from '@/types/api-reponse';

type CreatePostResponse = ApiResponse & {
  post?: PostDto;
};

export default CreatePostResponse;
