import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($registerRequest: RegisterRequest!) {
    register(registerRequest: $registerRequest) {
      code
      message
      success
    }
  }
`;
