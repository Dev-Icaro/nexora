import { beforeEach, describe, expect, it } from 'vitest';

import { User } from '@/models/user.model';
import { clearDb } from '../../setup/db';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestServer, singleResult } from '../../setup/server';

const UPDATE_PROFILE = `
  mutation UpdateProfile($input: UpdateProfileRequest!) {
    updateProfile(updateProfileRequest: $input) {
      code
      success
      user { id bio position }
    }
  }
`;

const UPDATE_THEME = `
  mutation UpdateThemePreference($theme: ThemePreference!) {
    updateThemePreference(theme: $theme) {
      code
      success
      user { id themePreference }
    }
  }
`;

describe('updateProfile', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('updates bio and position', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        {
          query: UPDATE_PROFILE,
          variables: { input: { bio: 'Software engineer', position: 'Backend dev' } },
        },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.updateProfile as { user: { bio: string; position: string } };
    expect(result.user.bio).toBe('Software engineer');
    expect(result.user.position).toBe('Backend dev');

    const dbUser = await User.findById(user.id);
    expect(dbUser?.bio).toBe('Software engineer');
    expect(dbUser?.position).toBe('Backend dev');
  });

  it('partial update only changes provided fields', async () => {
    const user = await createTestUser();
    await User.findByIdAndUpdate(user.id, { bio: 'Original bio', position: 'Original position' });

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: UPDATE_PROFILE, variables: { input: { bio: 'Updated bio' } } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.updateProfile as { user: { bio: string; position: string } };
    expect(result.user.bio).toBe('Updated bio');
  });
});

describe('updateThemePreference', () => {
  const { server, buildContext } = createTestServer();

  beforeEach(clearDb);

  it('updates the theme and persists to DB', async () => {
    const user = await createTestUser();

    const { data, errors } = singleResult(
      await server.executeOperation(
        { query: UPDATE_THEME, variables: { theme: 'dark' } },
        { contextValue: buildContext({ userId: user.id }) },
      ),
    );

    expect(errors).toBeUndefined();
    const result = data?.updateThemePreference as { user: { themePreference: string } };
    expect(result.user.themePreference).toBe('dark');

    const dbUser = await User.findById(user.id);
    expect(dbUser?.themePreference).toBe('dark');
  });

  it('accepts all valid theme values', async () => {
    const user = await createTestUser();

    for (const theme of ['light', 'dark', 'system']) {
      const { errors } = singleResult(
        await server.executeOperation(
          { query: UPDATE_THEME, variables: { theme } },
          { contextValue: buildContext({ userId: user.id }) },
        ),
      );
      expect(errors).toBeUndefined();
    }
  });
});
