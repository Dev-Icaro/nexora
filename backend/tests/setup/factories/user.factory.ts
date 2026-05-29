import { faker } from '@faker-js/faker';

import { hashPassword } from '@/utils/crypto';
import { User } from '@/models/user.model';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  plainPassword: string;
}

export async function createTestUser(
  overrides: {
    username?: string;
    email?: string;
    plainPassword?: string;
    emailVerified?: boolean;
  } = {},
): Promise<TestUser> {
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  const plainPassword = overrides.plainPassword ?? 'TestPassword123!';
  const hashedPassword = await hashPassword(plainPassword);

  const doc = await User.create({
    username: overrides.username ?? faker.internet.username().slice(0, 20),
    email: overrides.email ?? faker.internet.email(),
    password: hashedPassword,
    emailVerified: overrides.emailVerified ?? true,
    createdAt: new Date().toISOString(),
  });

  return {
    id: doc._id.toString(),
    email: doc.email,
    username: doc.username,
    plainPassword,
  };
}
