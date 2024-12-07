import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://ldcysindetsevcwapdvx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkY3lzaW5kZXRzZXZjd2FwZHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDY2OTQsImV4cCI6MjA0OTEyMjY5NH0.9mmVYOCTv2Si1HLw9L8AfFBuFvhjxh1ef3kcQLajwjA';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);