import type CreatePostResponse from '@/dtos/create-post-response.dto';
import type PostDto from '@/dtos/post.dto';

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
   * @returns A promise resolving to a confirmation string.
   */
  deletePost(userId: string, postId: string): Promise<string>;

  /**
   * Toggles a like on a post. Adds a like if the user hasn't liked the post yet;
   * removes it if they have (unlike).
   *
   * @param userId - The authenticated user's ID.
   * @param postId - The ID of the post to like or unlike.
   * @returns A promise resolving to the updated {@link PostDto}.
   */
  likePost(userId: string, postId: string): Promise<PostDto>;
}
