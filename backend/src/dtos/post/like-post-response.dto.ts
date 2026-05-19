import type PostDto from './post.dto';
import type { ApiResponse } from '@/types/api-reponse';

type LikePostResponse = ApiResponse & {
  post?: PostDto;
};

export default LikePostResponse;
