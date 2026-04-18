let accessToken: string | null = null;
let onUnauthenticated: (() => void) | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setOnUnauthenticated = (cb: () => void) => {
  onUnauthenticated = cb;
};

export const triggerUnauthenticated = () => onUnauthenticated?.();
