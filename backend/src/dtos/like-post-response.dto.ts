import type PostDto from '@/dtos/post.dto';
import type { ApiResponse } from '@/types/api-reponse';

type LikePostResponse = ApiResponse & {
  post?: PostDto;
};

export default LikePostResponse;
