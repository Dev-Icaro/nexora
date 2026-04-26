interface AppSettings {
  ACCESS_TOKEN_DURATION_MINUTES: number;
  REFRESH_TOKEN_DURATION_MINUTES: number;
  REFRESH_TOKEN_COOKIE_NAME: string;
  REFRESH_TOKEN_COOKIE_SAME_SITE: 'strict' | 'lax' | 'none';
}

const settings: AppSettings = {
  ACCESS_TOKEN_DURATION_MINUTES: 1, // We can increse after test
  REFRESH_TOKEN_DURATION_MINUTES: 10_080,
  REFRESH_TOKEN_COOKIE_NAME: 'nexora-refresh-token',
  REFRESH_TOKEN_COOKIE_SAME_SITE: 'none',
};

export default settings;
