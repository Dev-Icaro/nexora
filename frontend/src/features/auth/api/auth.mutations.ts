import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterRequest!) {
    register(registerInput: $registerInput) {
      code
      message
      success
    }
  }
`;
