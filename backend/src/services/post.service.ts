import type CreatePostResponse from '@/dtos/create-post-response.dto';
import type PostDto from '@/dtos/post.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import { Post } from '@/models/post.model';

import type { IPostService } from './interfaces/post.service.interface';
import type { IUserService } from './interfaces/user.service.interface';

export class PostService implements IPostService {
  constructor(private readonly userService: IUserService) {}

  async createPost(userId: string, body: string, mediaUrl?: string): Promise<CreatePostResponse> {
    if (mediaUrl !== undefined) {
      try {
        new URL(mediaUrl);
      } catch {
        throw new BadRequestException('mediaUrl must be a valid URL');
      }
    }

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const createdAt = new Date().toISOString();
    const post = await Post.create({
      body,
      mediaUrl,
      username: user.username,
      user: userId,
      createdAt,
      comments: [],
      likes: [],
    });

    return {
      code: 201,
      success: true,
      message: 'Post created successfully',
      post: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        username: post.username ?? '',
        createdAt: post.createdAt ?? createdAt,
        comments: [],
        likes: [],
      },
    };
  }

  async deletePost(userId: string, postId: string): Promise<string> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.user?.toString() !== userId) throw new ForbiddenException('Action not allowed');

    await Post.deleteOne({ _id: postId });
    return 'Post deleted successfully';
  }

  async likePost(userId: string, postId: string): Promise<PostDto> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const existing = await Post.findById(postId);
    if (!existing) throw new NotFoundException('Post not found');

    const alreadyLiked = existing.likes.some(like => like.username === user.username);

    const post = await Post.findByIdAndUpdate(
      postId,
      alreadyLiked
        ? { $pull: { likes: { username: user.username } } }
        : { $push: { likes: { username: user.username, createdAt: new Date().toISOString() } } },
      { new: true },
    );

    if (!post) throw new NotFoundException('Post not found');

    return {
      id: post.id as string,
      body: post.body ?? '',
      mediaUrl: post.mediaUrl ?? undefined,
      username: post.username ?? '',
      createdAt: post.createdAt ?? '',
      comments: post.comments.map(c => ({
        id: c._id.toString(),
        body: c.body ?? '',
        username: c.username ?? '',
        createdAt: c.createdAt ?? '',
      })),
      likes: post.likes.map(l => ({
        id: l._id.toString(),
        username: l.username ?? '',
        createdAt: l.createdAt ?? '',
      })),
    };
  }
}
