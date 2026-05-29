/** Defines the contract for the social follow/unfollow system. */
export interface IFollowService {
  /**
   * Creates a follow relationship from `followerId` to `followingId` and increments
   * both users' counters atomically inside a MongoDB session transaction.
   *
   * @param followerId - The ID of the user initiating the follow.
   * @param followingId - The ID of the user being followed.
   * @throws {BadRequestException} If the user tries to follow themselves or is already following.
   */
  follow(followerId: string, followingId: string): Promise<void>;

  /**
   * Removes a follow relationship and atomically decrements both users' counters.
   *
   * @param followerId - The ID of the user initiating the unfollow.
   * @param followingId - The ID of the user being unfollowed.
   * @throws {BadRequestException} If the follow relationship does not exist.
   */
  unfollow(followerId: string, followingId: string): Promise<void>;
}
