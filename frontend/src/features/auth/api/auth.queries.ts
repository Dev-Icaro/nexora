import { gql } from '@apollo/client';

export const VALIDATE_PASSWORD_RESET_TOKEN_QUERY = gql`
  query ValidatePasswordResetToken($token: String!) {
    validatePasswordResetToken(token: $token) {
      code
      message
      success
    }
  }
`;
