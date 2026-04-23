type PostDto = {
  id: string;
  body: string;
  mediaUrl?: string;
  authorId: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export default PostDto;
