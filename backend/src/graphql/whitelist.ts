/**
 * GraphQL operation names that do not require a valid access token.
 */
export const GRAPHQL_AUTH_WHITELIST: ReadonlySet<string> = new Set([
  'Login',
  'Register',
  'Refresh',
  'Logout',
  'IntrospectionQuery',
]);
