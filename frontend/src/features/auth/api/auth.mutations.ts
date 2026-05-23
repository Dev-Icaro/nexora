import { graphql } from '@/gql';

export const REGISTER_MUTATION = graphql(`
  mutation Register($registerRequest: RegisterRequest!) {
    register(registerRequest: $registerRequest) {
      code
      message
      success
    }
  }
`);

export const LOGIN_MUTATION = graphql(`
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
`);

export const REFRESH_MUTATION = graphql(`
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
`);

export const LOGOUT_MUTATION = graphql(`
  mutation Logout {
    logout {
      code
      message
      success
    }
  }
`);

export const REQUEST_PASSWORD_RESET_MUTATION = graphql(`
  mutation RequestPasswordReset($requestPasswordResetRequest: RequestPasswordResetRequest!) {
    requestPasswordReset(requestPasswordResetRequest: $requestPasswordResetRequest) {
      code
      message
      success
    }
  }
`);

export const APPLY_PASSWORD_RESET_MUTATION = graphql(`
  mutation ApplyPasswordReset($applyPasswordResetRequest: ApplyPasswordResetRequest!) {
    applyPasswordReset(applyPasswordResetRequest: $applyPasswordResetRequest) {
      code
      message
      success
    }
  }
`);
