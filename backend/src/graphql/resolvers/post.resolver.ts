import { postQueries } from '@/graphql/queries/post.query';
import { Comment } from '@/models/comment.model';
import { Like } from '@/models/like.model';

export const postResolver = {
  Query: {
    ...postQueries,
  },
  Post: {
    comments: (parent: { id: string }) => Comment.find({ postId: parent.id }).sort({ _id: 1 }),
    likes: (parent: { id: string }) => Like.find({ postId: parent.id }).sort({ _id: 1 }),
    likeCount: (parent: { likeCount: number }) => parent.likeCount,
    commentCount: (parent: { commentCount: number }) => parent.commentCount,
  },
};
