export type ApiResponse = {
  code: number;
  message: string;
  success: boolean;
};

/** Relay Cursor Connections page metadata. */
export type PageInfo = {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/** A single edge in a Relay Connection — the node plus its opaque cursor. */
export type Edge<T> = {
  node: T;
  cursor: string;
};

/** A Relay-compliant connection wrapping a list of edges and page metadata. */
export type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
};

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
