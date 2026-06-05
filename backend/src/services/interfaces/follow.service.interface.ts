import type { PaginationParams } from '@/dtos/shared/pagination';
import type { UserConnectionDto } from '@/dtos/user';

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

  /**
   * Returns a cursor-paginated list of users who follow the given user.
   *
   * @param userId - The ID of the user whose followers are being listed.
   * @param params - Pagination parameters (`first` and optional `after` cursor).
   * @returns A paginated connection of follower `UserDto` objects.
   */
  getFollowers(userId: string, params: PaginationParams): Promise<UserConnectionDto>;

  /**
   * Returns a cursor-paginated list of users that the given user is following.
   *
   * @param userId - The ID of the user whose followings are being listed.
   * @param params - Pagination parameters (`first` and optional `after` cursor).
   * @returns A paginated connection of following `UserDto` objects.
   */
  getFollowings(userId: string, params: PaginationParams): Promise<UserConnectionDto>;
}
