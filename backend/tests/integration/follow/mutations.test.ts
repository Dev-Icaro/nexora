import { beforeEach, describe, expect, it } from 'vitest';

import { Follow } from '@/models/follow.model';
import { User } from '@/models/user.model';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const REMOVE_FOLLOWER = `
  mutation RemoveFollower($userId: ID!) {
    removeFollower(userId: $userId) {
      code
      success
      message
    }
  }
`;

const FOLLOW_USER = `
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      code
      success
      message
    }
  }
`;

const UNFOLLOW_USER = `
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      code
      success
      message
    }
  }
`;

describe('followUser', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('creates a follow document and increments counters on both users', async () => {
    const follower = await createTestUser();
    const target = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: FOLLOW_USER, variables: { userId: target.id } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.followUser).toMatchObject({ code: 200, success: true });

    const followDoc = await Follow.findOne({ followerId: follower.id, followingId: target.id });
    expect(followDoc).not.toBeNull();

    const followerDoc = await User.findById(follower.id);
    const targetDoc = await User.findById(target.id);
    expect(followerDoc?.followingCount).toBe(1);
    expect(targetDoc?.followersCount).toBe(1);
  });

  it('returns BAD_USER_INPUT when trying to follow yourself', async () => {
    const user = await createTestUser();

    const { errors } = singleResult(
      await server.executeOperation(
        { query: FOLLOW_USER, variables: { userId: user.id } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeDefined();
    expect(errors![0].extensions?.code).toBe('BAD_USER_INPUT');
    expect(await Follow.findOne({ followerId: user.id, followingId: user.id })).toBeNull();
  });

  it('is a no-op when already following the user', async () => {
    const follower = await createTestUser();
    const target = await createTestUser();
    const ctx = () => buildContext({ userId: follower.id });

    await server.executeOperation({ query: FOLLOW_USER, variables: { userId: target.id } }, { contextValue: ctx() });

    const { data, errors } = singleResult(
      await server.executeOperation({ query: FOLLOW_USER, variables: { userId: target.id } }, { contextValue: ctx() }),
    );

    expect(errors).toBeUndefined();
    expect(data?.followUser).toMatchObject({ code: 200, success: true });

    const follows = await Follow.find({ followerId: follower.id, followingId: target.id });
    expect(follows).toHaveLength(1);
  });
});

describe('unfollowUser', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('removes the follow document and decrements counters on both users', async () => {
    const follower = await createTestUser();
    const target = await createTestUser();

    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: target.id } },
      { contextValue: buildContext({ userId: follower.id }) },
    );

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: UNFOLLOW_USER, variables: { userId: target.id } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.unfollowUser).toMatchObject({ code: 200, success: true });

    expect(await Follow.findOne({ followerId: follower.id, followingId: target.id })).toBeNull();

    const followerDoc = await User.findById(follower.id);
    const targetDoc = await User.findById(target.id);
    expect(followerDoc?.followingCount).toBe(0);
    expect(targetDoc?.followersCount).toBe(0);
  });

  it('is a no-op when not following the user', async () => {
    const follower = await createTestUser();
    const target = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: UNFOLLOW_USER, variables: { userId: target.id } },
        { contextValue: buildContext({ userId: follower.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.unfollowUser).toMatchObject({ code: 200, success: true });
  });

  it('counter accuracy: multiple follows and unfollows stay consistent', async () => {
    const a = await createTestUser();
    const b = await createTestUser();
    const c = await createTestUser();

    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: b.id } },
      { contextValue: buildContext({ userId: a.id }) },
    );
    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: b.id } },
      { contextValue: buildContext({ userId: c.id }) },
    );
    await server.executeOperation(
      { query: UNFOLLOW_USER, variables: { userId: b.id } },
      { contextValue: buildContext({ userId: a.id }) },
    );

    const bDoc = await User.findById(b.id);
    expect(bDoc?.followersCount).toBe(1);

    const aDoc = await User.findById(a.id);
    expect(aDoc?.followingCount).toBe(0);
  });
});

describe('removeFollower', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('removes the follow document and decrements counters on both users', async () => {
    const target = await createTestUser();
    const follower = await createTestUser();

    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: target.id } },
      { contextValue: buildContext({ userId: follower.id }) },
    );

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REMOVE_FOLLOWER, variables: { userId: follower.id } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.removeFollower).toMatchObject({ code: 200, success: true });

    expect(await Follow.findOne({ followerId: follower.id, followingId: target.id })).toBeNull();

    const followerDoc = await User.findById(follower.id);
    const targetDoc = await User.findById(target.id);
    expect(followerDoc?.followingCount).toBe(0);
    expect(targetDoc?.followersCount).toBe(0);
  });

  it('is a no-op when the user is not a follower', async () => {
    const target = await createTestUser();
    const notAFollower = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: REMOVE_FOLLOWER, variables: { userId: notAFollower.id } },
        { contextValue: buildContext({ userId: target.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    expect(data?.removeFollower).toMatchObject({ code: 200, success: true });
  });

  it('only removes the targeted follower and leaves other followers intact', async () => {
    const target = await createTestUser();
    const followerA = await createTestUser();
    const followerB = await createTestUser();

    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: target.id } },
      { contextValue: buildContext({ userId: followerA.id }) },
    );
    await server.executeOperation(
      { query: FOLLOW_USER, variables: { userId: target.id } },
      { contextValue: buildContext({ userId: followerB.id }) },
    );

    await server.executeOperation(
      { query: REMOVE_FOLLOWER, variables: { userId: followerA.id } },
      { contextValue: buildContext({ userId: target.id }) },
    );

    expect(await Follow.findOne({ followerId: followerA.id, followingId: target.id })).toBeNull();
    expect(await Follow.findOne({ followerId: followerB.id, followingId: target.id })).not.toBeNull();

    const targetDoc = await User.findById(target.id);
    expect(targetDoc?.followersCount).toBe(1);

    const followerADoc = await User.findById(followerA.id);
    expect(followerADoc?.followingCount).toBe(0);

    const followerBDoc = await User.findById(followerB.id);
    expect(followerBDoc?.followingCount).toBe(1);
  });
});
