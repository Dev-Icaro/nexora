import type { ApiResponse } from '@/dtos/shared';

import type PostDto from './post.dto';

type LikePostResponse = ApiResponse & {
  post?: PostDto;
};

export default LikePostResponse;
