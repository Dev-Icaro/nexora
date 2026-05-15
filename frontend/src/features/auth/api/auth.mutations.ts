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
        avatarUrl
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
        avatarUrl
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

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($requestPasswordResetRequest: RequestPasswordResetRequest!) {
    requestPasswordReset(requestPasswordResetRequest: $requestPasswordResetRequest) {
      code
      message
      success
    }
  }
`;

export const APPLY_PASSWORD_RESET_MUTATION = gql`
  mutation ApplyPasswordReset($applyPasswordResetRequest: ApplyPasswordResetRequest!) {
    applyPasswordReset(applyPasswordResetRequest: $applyPasswordResetRequest) {
      code
      message
      success
    }
  }
`;
