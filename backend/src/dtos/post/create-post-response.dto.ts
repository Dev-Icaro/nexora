import type { ApiResponse } from '@/dtos/shared';

import type PostDto from './post.dto';

type CreatePostResponse = ApiResponse & {
  post?: PostDto;
};

export default CreatePostResponse;
