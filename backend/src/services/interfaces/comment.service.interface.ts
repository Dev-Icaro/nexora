import type CommentDto from '@/dtos/comment.dto';
import type CreateCommentResponse from '@/dtos/create-comment-response.dto';
import type DeleteCommentResponse from '@/dtos/delete-comment-response.dto';

/** Defines the contract for comment creation, deletion, and retrieval. */
export interface ICommentService {
  /**
   * Creates a new comment on a post.
   *
   * @param userId - The authenticated user's ID.
   * @param postId - The ID of the post to comment on.
   * @param body - The text content of the comment.
   * @returns A promise resolving to a {@link CreateCommentResponse} with the created comment.
   */
  createComment(userId: string, postId: string, body: string): Promise<CreateCommentResponse>;

  /**
   * Deletes a comment from a post. Only the comment author may delete their own comment.
   *
   * @param userId - The authenticated user's ID (must match the comment author).
   * @param postId - The ID of the post the comment belongs to.
   * @param commentId - The ID of the comment to delete.
   * @returns A promise resolving to a {@link DeleteCommentResponse} with the deleted comment.
   */
  deleteComment(userId: string, postId: string, commentId: string): Promise<DeleteCommentResponse>;

  /**
   * Retrieves all comments for a given post, ordered by creation time ascending.
   *
   * @param postId - The ID of the post.
   * @returns A promise resolving to an array of {@link CommentDto}.
   */
  getCommentsByPostId(postId: string): Promise<CommentDto[]>;
}
