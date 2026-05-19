import type CommentDto from './comment.dto';
import type { ApiResponse } from '@/types/api-reponse';

type CreateCommentResponse = ApiResponse & {
  comment?: CommentDto;
};

export default CreateCommentResponse;
