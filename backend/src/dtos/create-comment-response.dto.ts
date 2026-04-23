import type CommentDto from '@/dtos/comment.dto';
import type { ApiResponse } from '@/types/api-reponse';

type CreateCommentResponse = ApiResponse & {
  comment?: CommentDto;
};

export default CreateCommentResponse;
