import type CommentDto from '@/dtos/comment.dto';
import type CreateCommentResponse from '@/dtos/create-comment-response.dto';
import type DeleteCommentResponse from '@/dtos/delete-comment-response.dto';
import { ForbiddenException, NotFoundException } from '@/exceptions';
import { Comment } from '@/models/comment.model';
import { Post } from '@/models/post.model';

import type { ICommentService } from './interfaces/comment.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class CommentService implements ICommentService {
  constructor(private readonly userService: IUserService) {}

  async createComment(userId: string, postId: string, body: string): Promise<CreateCommentResponse> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const createdAt = new Date().toISOString();
    const comment = await Comment.create({ postId, userId, username: user.username, body, createdAt });

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    return {
      code: 201,
      success: true,
      message: 'Comment created successfully',
      comment: {
        id: comment.id as string,
        postId: comment.postId.toString(),
        body: comment.body,
        username: comment.username,
        createdAt: comment.createdAt,
      },
    };
  }

  async deleteComment(userId: string, postId: string, commentId: string): Promise<DeleteCommentResponse> {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId) throw new ForbiddenException('Action not allowed');

    await Comment.deleteOne({ _id: commentId });
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

    return {
      code: 200,
      success: true,
      message: 'Comment deleted successfully',
      comment: {
        id: comment.id as string,
        postId: comment.postId.toString(),
        body: comment.body,
        username: comment.username,
        createdAt: comment.createdAt,
      },
    };
  }

  async getCommentsByPostId(postId: string): Promise<CommentDto[]> {
    const comments = await Comment.find({ postId }).sort({ _id: 1 });
    return comments.map(c => ({
      id: c.id as string,
      postId: c.postId.toString(),
      body: c.body,
      username: c.username,
      createdAt: c.createdAt,
    }));
  }
}
