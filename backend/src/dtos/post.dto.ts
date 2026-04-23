type PostDto = {
  id: string;
  body: string;
  mediaUrl?: string;
  username: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export default PostDto;
