import type { CreatePostDto, GetPostUploadUrlDto, PostConnectionDto, PostDto } from '@/dtos/post';
import type { PaginationParams, UploadUrlDto } from '@/dtos/shared';

/** Defines the contract for post creation, deletion, and social interactions. */
export interface IPostService {
  /**
   * Returns all posts as DTOs. Intended only for the legacy unbounded `getPosts` query.
   *
   * @returns A promise resolving to an array of {@link PostDto}.
   */
  getAll(): Promise<PostDto[]>;

  /**
   * Generates a presigned POST URL for uploading post media directly to S3.
   * Magic-byte validation happens server-side in {@link create} — not here.
   *
   * @param dto - Upload parameters: userId, filename, contentType, and declared file size.
   * @returns A promise resolving to an {@link UploadUrlDto} with the URL, form fields, and object key.
   */
  getUploadUrl(dto: GetPostUploadUrlDto): Promise<UploadUrlDto>;

  /**
   * Creates a new post on behalf of the authenticated user.
   * If `objectKey` is provided, validates ownership, verifies the file in S3, and moves it to confirmed storage.
   *
   * @param dto - Post content including userId and optional S3 pending object key from {@link getUploadUrl}.
   * @returns A promise resolving to the created {@link PostDto}.
   */
  create(dto: CreatePostDto): Promise<PostDto>;

  /**
   * Deletes a post. Only the post owner may delete their own post.
   *
   * @param userId - The authenticated user's ID (must match the post owner).
   * @param postId - The ID of the post to delete.
   */
  delete(userId: string, postId: string): Promise<void>;

  /**
   * Toggles a like on a post. Adds a like if the user hasn't liked the post yet;
   * removes it if they have (unlike).
   *
   * @param userId - The authenticated user's ID.
   * @param postId - The ID of the post to like or unlike.
   * @returns A promise resolving to the updated {@link PostDto}.
   */
  toggleLike(userId: string, postId: string): Promise<PostDto>;

  /**
   * Retrieves a single post by its ID.
   *
   * @param postId - The ID of the post to fetch.
   * @returns A promise resolving to a {@link PostDto} if found, or `null` if no post matches the ID.
   */
  getById(postId: string): Promise<PostDto | null>;

  /**
   * Returns a paginated connection of posts ordered most recent first,
   * following the Relay Cursor Connections specification.
   *
   * @param params - Cursor-based pagination parameters.
   * @returns A promise resolving to a {@link PostConnectionDto} with edges and page info.
   */
  getFeed(params: PaginationParams): Promise<PostConnectionDto>;

  /**
   * Returns a paginated connection of posts by a specific user, ordered most recent first.
   *
   * @param userId - The ID of the user whose posts to fetch.
   * @param params - Cursor-based pagination parameters.
   * @returns A promise resolving to a {@link PostConnectionDto} with edges and page info.
   */
  getByUserId(userId: string, params: PaginationParams): Promise<PostConnectionDto>;

  /**
   * Returns a paginated connection of posts bookmarked by the given user, ordered by most recently bookmarked first.
   *
   * @param userId - The authenticated user's ID.
   * @param params - Cursor-based pagination parameters.
   * @returns A promise resolving to a {@link PostConnectionDto} with edges and page info.
   */
  getBookmarked(userId: string, params: PaginationParams): Promise<PostConnectionDto>;
}
