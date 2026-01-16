import { createClient } from '@libsql/client';

// This file connects your VITE_TURSO environment variables to the app
export const turso = createClient({
  url: import.meta.env.VITE_TURSO_URL,
  authToken: import.meta.env.VITE_TURSO_TOKEN,
});