import type { CommentDto, CreateCommentDto, DeleteCommentDto } from '@/dtos/comment';
import { ForbiddenException, NotFoundException } from '@/exceptions';
import { Comment, type CommentDocument } from '@/models/comment.model';
import { Post } from '@/models/post.model';

import type { ICommentService } from './interfaces/comment.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class CommentService implements ICommentService {
  constructor(private readonly userService: IUserService) {}

  async create({ userId, postId, body }: CreateCommentDto): Promise<CommentDto> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.userService.getById(userId);
    if (!user) throw new NotFoundException('User not found');

    const comment = await Comment.create({ postId, userId, username: user.username, body });

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    return this.toDto(comment);
  }

  async delete({ userId, postId, commentId }: DeleteCommentDto): Promise<CommentDto> {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId.toString() !== userId) throw new ForbiddenException('Action not allowed');

    await Comment.deleteOne({ _id: commentId });
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

    return this.toDto(comment);
  }

  async getByPostId(postId: string): Promise<CommentDto[]> {
    const comments = await Comment.find({ postId }).sort({ _id: 1 });
    return comments.map(c => this.toDto(c));
  }

  private toDto(doc: CommentDocument): CommentDto {
    return {
      id: doc._id.toString(),
      postId: doc.postId.toString(),
      body: doc.body,
      authorId: doc.userId.toString(),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
