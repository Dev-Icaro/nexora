export type CommentDto = {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  likeCount: number;
  createdAt: string;
};

export default CommentDto;
