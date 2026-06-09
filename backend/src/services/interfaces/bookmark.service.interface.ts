/** Defines the contract for adding and removing post bookmarks. */
export interface IBookmarkService {
  /**
   * Bookmarks a post on behalf of the authenticated user. No-op if already bookmarked.
   *
   * @param userId - The ID of the authenticated user.
   * @param postId - The ID of the post to bookmark.
   * @throws {NotFoundException} If the post does not exist.
   */
  add(userId: string, postId: string): Promise<void>;

  /**
   * Removes a bookmark from a post. No-op if the bookmark does not exist.
   *
   * @param userId - The ID of the authenticated user.
   * @param postId - The ID of the post to unbookmark.
   */
  remove(userId: string, postId: string): Promise<void>;
}
