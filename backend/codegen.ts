import type { CodegenConfig } from '@graphql-codegen/cli';

import { typeDefs } from './src/graphql/typeDefs';

const config: CodegenConfig = {
  schema: typeDefs,
  generates: {
    'src/graphql/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context#GraphQLContext',
        // Generate union types instead of TS enums — consistent with the rest of the codebase
        enumsAsTypes: true,
        scalars: {
          ID: 'string',
        },
        // Map each GraphQL type to the runtime object that resolvers actually receive as `parent`.
        // Post and User come from service DTOs (via toPostDto/toUserDto mappers).
        // Comment and Like come directly from Mongoose DataLoader results.
        mappers: {
          Post: '../../dtos/post/post.dto#PostDto',
          User: '../../dtos/user/user.dto#UserDto',
          Comment: '../../dtos/comment/comment.dto#CommentDto',
          Like: '../../dtos/post/like.dto#LikeDto',
        },
      },
    },
  },
};

export default config;
