import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log a warning instead of throwing an error to prevent the app from crashing
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. App is running in Local JSON mode.');
}

// Export a conditionally initialized client or null
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'apikey': supabaseKey
          }
        }
      }
    )
  : null as any;