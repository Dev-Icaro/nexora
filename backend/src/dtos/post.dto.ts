type PostDto = {
  id: string;
  body: string;
  mediaUrl?: string;
  username: string;
  createdAt: string;
  comments: { id: string; body: string; username: string; createdAt: string }[];
  likes: { id: string; username: string; createdAt: string }[];
};

export default PostDto;
