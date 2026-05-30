import { graphql } from '@/gql';

export const REGISTER_MUTATION = graphql(`
  mutation Register($registerRequest: RegisterRequest!) {
    register(registerRequest: $registerRequest)
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

export const VERIFY_EMAIL_MUTATION = graphql(`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
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

export const RESEND_VERIFICATION_EMAIL_MUTATION = graphql(`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`);
