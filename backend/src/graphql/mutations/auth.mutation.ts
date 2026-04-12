import { User } from '@/models/user.model';
import { hashPassword } from '@/utils/crypto';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authMutations = {
  register: async (_: unknown, { registerInput }: { registerInput: RegisterInput }) => {
    const { username, email, password, confirmPassword } = registerInput;

    if (password !== confirmPassword) {
      return { code: 400, success: false, message: 'Passwords do not match', user: null };
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return { code: 409, success: false, message: 'Email is already registered', user: null };
    }

    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    const newUser = await User.create({ username, email, password: hashedPassword, createdAt });

    return {
      code: 201,
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        token: '', // JWT generation is out of scope — implemented in a future task
        createdAt,
      },
    };
  },

  login: async () => {
    throw new Error('Not implemented');
  },
};
