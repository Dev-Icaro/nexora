import type { ApiResponse } from '@/dtos/shared';

import type CommentDto from './comment.dto';

type DeleteCommentResponse = ApiResponse & {
  comment?: CommentDto;
};

export default DeleteCommentResponse;
