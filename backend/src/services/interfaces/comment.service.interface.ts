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
}
