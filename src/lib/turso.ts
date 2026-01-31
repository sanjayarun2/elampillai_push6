// This file connects your VITE_TURSO environment variables to the app
// Gracefully handle missing credentials to prevent app crashes

const tursoUrl = import.meta.env.VITE_TURSO_URL;
const tursoToken = import.meta.env.VITE_TURSO_TOKEN;

// Helper to check if Turso is configured
export const isTursoConfigured = () => !!(tursoUrl && tursoToken);

// Create a mock client that throws helpful errors
const mockClient = {
  execute: async () => {
    throw new Error('Database not configured. Please set VITE_TURSO_URL and VITE_TURSO_TOKEN in .env file');
  },
  batch: async () => {
    throw new Error('Database not configured. Please set VITE_TURSO_URL and VITE_TURSO_TOKEN in .env file');
  }
};

// Dynamically import and create client only if configured
let tursoClientPromise: Promise<any> | null = null;

function getTursoClient() {
  if (!tursoClientPromise && isTursoConfigured()) {
    tursoClientPromise = import('@libsql/client').then(({ createClient }) => 
      createClient({
        url: tursoUrl!,
        authToken: tursoToken!,
      })
    ).catch(error => {
      console.error('Failed to create Turso client:', error);
      return mockClient;
    });
  }
  return tursoClientPromise || Promise.resolve(mockClient);
}

// Export a proxy that works with async operations
export const turso = {
  execute: async (...args: any[]) => {
    const client = await getTursoClient();
    return client.execute(...args);
  },
  batch: async (...args: any[]) => {
    const client = await getTursoClient();
    return client.batch(...args);
  }
} as any;