import type { ApiResponse } from '@/dtos/shared';

import type CommentDto from './comment.dto';

type CreateCommentResponse = ApiResponse & {
  comment?: CommentDto;
};

export default CreateCommentResponse;
