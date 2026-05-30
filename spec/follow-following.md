# Follow / Following System

## Problem Statement

Users cannot follow other users on Nexora. All follower, following, and post count stats displayed in the sidebar and profile page are hardcoded placeholder values, giving authenticated users no accurate picture of their social graph or any way to build one.

## Solution

Introduce a first-class follow/unfollow system. Users can follow or unfollow any other user (except themselves). Follower, following, and post counts are stored as denormalized counters on the User document for fast reads, backed by a periodic reconciliation job for correctness. The sidebar always shows the logged-in user's true stats; profile pages show any user's true stats alongside a Follow or Unfollow button. The post feed surfaces a Follow button on posts authored by users the viewer does not yet follow.

## User Stories

1. As an authenticated user, I want to follow another user, so that I can build a social connection with them.
2. As an authenticated user, I want to unfollow a user I already follow, so that I can manage my social graph.
3. As an authenticated user, I want to see a Follow button on a profile I do not yet follow, so that I can follow them in one click.
4. As an authenticated user, I want to see an Unfollow button on a profile I already follow, so that I can unfollow them in one click.
5. As an authenticated user, I want the Follow/Unfollow button to update immediately without a page reload, so that the interaction feels instant.
6. As an authenticated user, I want to see my own follower count in the sidebar, so that I always know how many people follow me.
7. As an authenticated user, I want to see my own following count in the sidebar, so that I always know how many people I follow.
8. As an authenticated user, I want to see my own post count in the sidebar, so that I know how many posts I have published.
9. As an authenticated user visiting another user's profile, I want to see their follower count, following count, and post count, so that I can gauge their activity on the platform.
10. As an authenticated user viewing the post feed, I want to see a Follow button next to posts authored by users I do not yet follow, so that I can follow interesting authors without leaving the feed.
11. As an authenticated user viewing the post feed, I want the Follow button to disappear once I follow that author, so that the feed stays clean and uncluttered.
12. As an authenticated user, I want to be prevented from following myself, so that my follower and following counts remain accurate.
13. As an unauthenticated visitor, I want to see a user's follower, following, and post counts on their profile, so that I can understand their presence on the platform without signing in.
14. As an authenticated user, I want the follow action in the feed to complete optimistically, so that I do not have to wait for the server to update the UI.
15. As a platform operator, I want follower and following counters to be periodically reconciled against the follow collection, so that denormalized counts remain accurate even if an atomic update ever fails.
16. As a platform operator, I want post counts to be tracked as a denormalized counter on the user document, so that profile and sidebar stats load without an aggregation query.

## Implementation Decisions

### Follow Collection

A dedicated `Follow` collection stores the social graph. Each document holds a `followerId`, a `followingId`, and a `createdAt` timestamp. A compound unique index on `{ followerId, followingId }` prevents duplicate follows at the database level. A single-field index on `followingId` supports efficient "who follows this user?" lookups.

### Denormalized Counters on User

Three counters are added to the User document: `followersCount`, `followingCount`, and `postCount`, all defaulting to `0`. These enable O(1) stat reads without aggregation. `postCount` is incremented when a post is created and decremented when one is deleted.

### Counter Sync Strategy

Two layers of consistency:

1. **Atomic `$inc`** — on every follow or unfollow, both affected users' counters are updated inside a MongoDB session transaction alongside the Follow document write. On post create/delete, the author's `postCount` is similarly `$inc`-ed atomically.
2. **Reconciliation cron job** — a periodic background job recomputes the true counts by aggregating the Follow collection and the Post collection, then patches any User document whose stored value diverges. This follows the same pattern as the existing storage-counter reconciliation job.

### GraphQL Schema Changes

The `User` type gains four new fields:

- `followersCount: Int!`
- `followingCount: Int!`
- `postCount: Int!`
- `isFollowing: Boolean` — viewer-dependent; `null` when the request is unauthenticated

Two new mutations are added:

```graphql
followUser(userId: ID!): FollowUserResponse!
unfollowUser(userId: ID!): UnfollowUserResponse!
```

Each response follows the existing envelope shape: `code`, `success`, `message`, and a `user` field returning the updated target User (so the client can reconcile `followersCount` and `isFollowing` from the server response).

### `isFollowing` Field Resolver and DataLoader

`isFollowing` is resolved as a field resolver on `User`. It is viewer-scoped (depends on the logged-in user in GraphQL context) and therefore cannot share a generic entity loader. A dedicated `isFollowingLoader` is created per request, keyed by `followingId`. It batches all `isFollowing` checks in a single request into one `Follow.find({ followerId: viewerId, followingId: { $in: ids } })` query. This supports future user list views (followers list, search results) and the post feed, where many authors may need to be checked in a single response.

### Follow / Unfollow Business Logic

The `FollowService` owns all follow-related logic:

- **Self-follow prevention**: if `followerId === followingId`, throw `BadRequestException` before touching the database.
- **Idempotency**: a second follow attempt on an already-followed user returns a `BadRequestException` ("already following"). An unfollow of a non-followed user returns `BadRequestException` ("not following").
- **Atomicity**: the Follow document write and both `$inc` operations run inside a single MongoDB session transaction. On abort, no counter is modified.

### Frontend Data Flow

**Sidebar stats**: the sidebar calls the existing `useProfile` hook with the logged-in user's ID. Apollo caches the response under the user's ID, so visiting one's own profile page reuses the same cache entry with no duplicate network request.

**Profile page**: the `GET_PROFILE` query is extended to include the four new `User` fields. The Follow/Unfollow button renders only when the viewer is authenticated and `isOwnProfile` is `false`. The button text reflects the current `isFollowing` value.

**Post feed**: the `author` selection in the feed and user-posts queries is extended to include `isFollowing`. A Follow button appears on post cards where `isFollowing === false` and the author is not the viewer. After clicking, the button disappears.

**Optimistic UI**: both the profile Follow/Unfollow button and the feed Follow button apply an optimistic Apollo cache update that flips `isFollowing` and adjusts `followersCount` before the server responds. Apollo rolls back the optimistic write automatically if the mutation fails.

**`useFollow` hook**: a single hook in `features/follow/` exposes `follow(userId)` and `unfollow(userId)`. It owns the mutation definitions, the optimistic cache update logic, and error toasts, keeping components free of mutation boilerplate.

### Self-Follow Defense in Depth

The backend `FollowService` throws on self-follow. The frontend hides the Follow/Unfollow button entirely when `isOwnProfile` is `true`, so the mutation is never fired in normal usage.

## Testing Decisions

Good tests verify observable behavior through the public interface of a module — they do not assert on private implementation details, internal state, or specific Mongoose query shapes. A test should remain valid after an internal refactor that preserves behavior.

### `FollowService` (backend integration tests)

Pattern: existing `tests/integration/user/mutations.test.ts` — use `createTestServer()`, `buildContext()`, and `createTestUser()` factory against a real test MongoDB instance.

Cover:
- Following a user creates a Follow document and increments both users' counters.
- Unfollowing removes the Follow document and decrements both counters.
- Following an already-followed user returns an error and leaves counters unchanged.
- Unfollowing a non-followed user returns an error and leaves counters unchanged.
- Self-follow returns an error.
- `followersCount` and `followingCount` on the target and follower users reflect the correct values after the operation.

### `isFollowingLoader` (backend integration tests)

Pattern: existing `tests/integration/loaders/batching.test.ts`.

Cover:
- A single batch query is issued when `isFollowing` is resolved for multiple users in one GraphQL request.
- Returns `true` for a user the viewer follows and `false` for one they do not.
- Returns `null` / is omitted when there is no authenticated viewer.

### `useFollow` hook (frontend unit tests)

Pattern: existing `test/features/post/use-feed.test.ts` — `renderHook` + `createWrapper` with `MockedProvider`.

Cover:
- Calling `follow(userId)` fires the `FOLLOW_USER` mutation.
- Optimistic cache update flips `isFollowing` to `true` before the server responds.
- On mutation success, the cache reflects the server's returned `followersCount`.
- On mutation error, the optimistic update is rolled back and an error toast is shown.
- Calling `unfollow(userId)` mirrors the above behavior in reverse.

## Out of Scope

- Followers / following user list pages (viewing who follows a user or who a user follows).
- Follow notifications.
- Follower-based feed filtering (showing only posts from followed users).
- Blocking or muting users.
- Mutual follow ("friends") detection.
- Follow counts visible to unauthenticated users on the public API (currently `isFollowing` returns `null`; counts are still visible).

## Further Notes

- The reconciliation cron job should log a warning whenever it finds and corrects a diverged counter, to make drift visible in the operations dashboard.
- When adding `postCount` `$inc` to `PostService`, verify that the existing `deletePost` path (which already handles media cleanup) wraps the counter decrement in the same session as the document deletion.
- The `isFollowingLoader` is viewer-scoped and must be re-instantiated per request (inside `createContext`), not shared across requests.
