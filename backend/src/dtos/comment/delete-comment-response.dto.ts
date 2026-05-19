import type CommentDto from './comment.dto';
import type { ApiResponse } from '@/types/api-reponse';

type DeleteCommentResponse = ApiResponse & {
  comment?: CommentDto;
};

export default DeleteCommentResponse;
