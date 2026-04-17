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

export const LOGIN_MUTATION = gql`
  mutation Login($loginRequest: LoginRequest!) {
    login(loginRequest: $loginRequest) {
      code
      message
      success
      accessToken
      user {
        id
        email
        username
      }
    }
  }
`;

export const REFRESH_MUTATION = gql`
  mutation Refresh {
    refresh {
      code
      message
      success
      accessToken
      user {
        id
        email
        username
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      code
      message
      success
    }
  }
`;
