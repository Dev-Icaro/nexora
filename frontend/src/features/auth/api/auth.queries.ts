import { graphql } from '@/gql';

export const VALIDATE_PASSWORD_RESET_TOKEN_QUERY = graphql(`
  query ValidatePasswordResetToken($token: String!) {
    validatePasswordResetToken(token: $token) {
      code
      message
      success
    }
  }
`);
