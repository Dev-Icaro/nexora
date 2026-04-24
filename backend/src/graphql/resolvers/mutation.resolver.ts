import { authMutations } from '@/graphql/mutations/auth.mutation';
import { commentMutations } from '@/graphql/mutations/comment.mutation';
import { postMutations } from '@/graphql/mutations/post.mutation';
import { userMutations } from '@/graphql/mutations/user.mutation';

export const mutationResolver = {
  Mutation: {
    ...authMutations,
    ...postMutations,
    ...commentMutations,
    ...userMutations,
  },
};
