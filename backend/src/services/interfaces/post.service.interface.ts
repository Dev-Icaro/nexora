import type CreatePostResponse from '@/dtos/create-post-response.dto';
import type DeletePostResponse from '@/dtos/delete-post-response.dto';
import type LikePostResponse from '@/dtos/like-post-response.dto';
import type PostDto from '@/dtos/post.dto';
import type PostConnectionDto from '@/dtos/post-connection.dto';

/** Defines the contract for post creation, deletion, and social interactions. */
export interface IPostService {
  /**
   * Creates a new post on behalf of the authenticated user.
   *
   * @param userId - The authenticated user's ID.
   * @param body - The text content of the post.
   * @param mediaUrl - Optional URL of an attached image; must be a valid URL if provided.
   * @returns A promise resolving to a {@link CreatePostResponse} with the created post.
   */
  createPost(userId: string, body: string, mediaUrl?: string): Promise<CreatePostResponse>;

  /**
   * Deletes a post. Only the post owner may delete their own post.
   *
   * @param userId - The authenticated user's ID (must match the post owner).
   * @param postId - The ID of the post to delete.
   * @returns A promise resolving to a {@link DeletePostResponse} confirming the deletion.
   */
  deletePost(userId: string, postId: string): Promise<DeletePostResponse>;

  /**
   * Toggles a like on a post. Adds a like if the user hasn't liked the post yet;
   * removes it if they have (unlike).
   *
   * @param userId - The authenticated user's ID.
   * @param postId - The ID of the post to like or unlike.
   * @returns A promise resolving to a {@link LikePostResponse} with the updated post.
   */
  likePost(userId: string, postId: string): Promise<LikePostResponse>;

  /**
   * Retrieves a single post by its ID.
   *
   * @param postId - The ID of the post to fetch.
   * @returns A promise resolving to a {@link PostDto} if found, or `null` if no post matches the ID.
   */
  getPostById(postId: string): Promise<PostDto | null>;

  /**
   * Returns a paginated connection of posts ordered most recent first,
   * following the Relay Cursor Connections specification.
   *
   * @param first - Maximum number of posts to return (default 10).
   * @param after - Opaque cursor from a previous page's `pageInfo.endCursor`.
   * @returns A promise resolving to a {@link PostConnectionDto} with edges and page info.
   */
  getFeed(first: number, after?: string): Promise<PostConnectionDto>;

  /**
   * Returns a paginated connection of posts by a specific user, ordered most recent first.
   *
   * @param userId - The ID of the user whose posts to fetch.
   * @param first - Maximum number of posts to return (default 10).
   * @param after - Opaque cursor from a previous page's `pageInfo.endCursor`.
   * @returns A promise resolving to a {@link PostConnectionDto} with edges and page info.
   */
  getUserPosts(userId: string, first: number, after?: string): Promise<PostConnectionDto>;
}
