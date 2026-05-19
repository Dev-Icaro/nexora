import type PostDto from './post.dto';
import type { ApiResponse } from '@/types/api-reponse';

type CreatePostResponse = ApiResponse & {
  post?: PostDto;
};

export default CreatePostResponse;
