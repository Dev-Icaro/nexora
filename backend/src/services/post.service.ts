import type CreatePostResponse from '@/dtos/create-post-response.dto';
import type DeletePostResponse from '@/dtos/delete-post-response.dto';
import type LikePostResponse from '@/dtos/like-post-response.dto';
import type PostConnectionDto from '@/dtos/post-connection.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import { Comment } from '@/models/comment.model';
import { Like } from '@/models/like.model';
import { Post } from '@/models/post.model';
import { decodeCursor, encodeCursor } from '@/utils/pagination';

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
    });

    return {
      code: 201,
      success: true,
      message: 'Post created successfully',
      post: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        authorId: String(post.user ?? userId),
        createdAt: post.createdAt ?? createdAt,
        likeCount: 0,
        commentCount: 0,
      },
    };
  }

  async deletePost(userId: string, postId: string): Promise<DeletePostResponse> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.user?.toString() !== userId) throw new ForbiddenException('Action not allowed');

    await Post.deleteOne({ _id: postId });
    await Promise.all([Comment.deleteMany({ postId }), Like.deleteMany({ postId })]);

    return { code: 200, success: true, message: 'Post deleted successfully' };
  }

  async getFeed(first = 10, after?: string): Promise<PostConnectionDto> {
    const limit = first;
    const query: Record<string, unknown> = {};

    if (after) {
      const cursorId = decodeCursor(after);
      if (cursorId) query._id = { $lt: cursorId };
    }

    const docs = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);
    const hasNextPage = docs.length > limit;
    const nodes = hasNextPage ? docs.slice(0, limit) : docs;

    const edges = nodes.map(post => ({
      node: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        authorId: String(post.user),
        createdAt: post.createdAt ?? '',
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
      },
      cursor: encodeCursor(post._id.toString()),
    }));

    return {
      edges,
      pageInfo: {
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
        hasNextPage,
        hasPreviousPage: !!after,
      },
    };
  }

  async likePost(userId: string, postId: string): Promise<LikePostResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const existing = await Post.findById(postId);
    if (!existing) throw new NotFoundException('Post not found');

    const alreadyLiked = await Like.findOne({ postId, userId });

    let post;
    if (alreadyLiked) {
      await Like.deleteOne({ _id: alreadyLiked._id });
      post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { new: true });
    } else {
      await Like.create({ postId, userId, username: user.username, createdAt: new Date().toISOString() });
      post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { new: true });
    }

    if (!post) throw new NotFoundException('Post not found');

    return {
      code: 200,
      success: true,
      message: alreadyLiked ? 'Post unliked successfully' : 'Post liked successfully',
      post: {
        id: post.id as string,
        body: post.body ?? '',
        mediaUrl: post.mediaUrl ?? undefined,
        authorId: String(post.user),
        createdAt: post.createdAt ?? '',
        likeCount: post.likeCount ?? 0,
        commentCount: post.commentCount ?? 0,
      },
    };
  }
}
