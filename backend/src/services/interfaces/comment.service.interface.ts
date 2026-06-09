import type { CommentDto, CreateCommentDto, DeleteCommentDto } from '@/dtos/comment';

/** Defines the contract for comment creation, deletion, and retrieval. */
export interface ICommentService {
  /**
   * Creates a new comment on a post.
   *
   * @param dto - Comment payload containing userId, postId, and body.
   * @returns A promise resolving to the created {@link CommentDto}.
   */
  create(dto: CreateCommentDto): Promise<CommentDto>;

  /**
   * Deletes a comment from a post. Only the comment author may delete their own comment.
   *
   * @param dto - Deletion payload containing userId, postId, and commentId.
   * @returns A promise resolving to the deleted {@link CommentDto}.
   */
  delete(dto: DeleteCommentDto): Promise<CommentDto>;

  /**
   * Retrieves all comments for a given post, ordered by creation time ascending.
   *
   * @param postId - The ID of the post.
   * @returns A promise resolving to an array of {@link CommentDto}.
   */
  getByPostId(postId: string): Promise<CommentDto[]>;

  /**
   * Adds a like to a comment. Throws if the user has already liked it.
   *
   * @param userId - The authenticated user's ID.
   * @param commentId - The ID of the comment to like.
   * @returns A promise resolving to the updated {@link CommentDto}.
   */
  like(userId: string, commentId: string): Promise<CommentDto>;

  /**
   * Removes a like from a comment. Throws if the user has not liked it.
   *
   * @param userId - The authenticated user's ID.
   * @param commentId - The ID of the comment to unlike.
   * @returns A promise resolving to the updated {@link CommentDto}.
   */
  unlike(userId: string, commentId: string): Promise<CommentDto>;
}
