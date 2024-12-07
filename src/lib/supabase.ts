import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// More comprehensive logging
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase Configuration Error', {
    urlProvided: !!supabaseUrl,
    keyProvided: !!supabaseKey,
    fullUrl: supabaseUrl,
    // Avoid logging full key for security
    keyLength: supabaseKey?.length || 0
  });
  throw new Error('Missing Supabase URL or Anon Key. Check your environment variables.');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    global: {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  }
);