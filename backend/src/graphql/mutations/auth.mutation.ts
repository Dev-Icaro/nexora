import RegisterRequest from '@/dtos/register-request.dto';
import RegisterResponse from '@/dtos/register-response.dto';
import { User } from '@/models/user.model';
import { hashPassword } from '@/utils/crypto';

export const authMutations = {
  register: async (
    _: unknown,
    { registerRequest }: { registerRequest: RegisterRequest },
  ): Promise<RegisterResponse> => {
    const { username, email, password, confirmPassword } = registerRequest;

    if (password !== confirmPassword) {
      return { code: 400, success: false, message: 'Passwords do not match' };
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return { code: 409, success: false, message: 'Email is already registered' };
    }

    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    const newUser = await User.create({ username, email, password: hashedPassword, createdAt });

    return {
      code: 201,
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id as string,
        email: newUser.email ?? '',
        username: newUser.username ?? '',
        token: '', // JWT generation is out of scope — implemented in a future task
        createdAt,
      },
    };
  },

  login: async () => {
    throw new Error('Not implemented');
  },
};
