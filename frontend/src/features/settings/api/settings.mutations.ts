import { graphql } from '@/gql';

export const UPDATE_THEME_PREFERENCE_MUTATION = graphql(`
  mutation UpdateThemePreference($theme: ThemePreference!) {
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
`);
