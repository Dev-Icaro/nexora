import { gql } from '@apollo/client';

export const UPDATE_THEME_PREFERENCE_MUTATION = gql`
  mutation UpdateThemePreference($theme: String!) {
    updateThemePreference(theme: $theme) {
      code
      message
      success
      user {
        id
        themePreference
      }
    }
  }
`;
