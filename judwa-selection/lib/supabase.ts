import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Built-in retries with backoff keep pages on a spinner for many seconds when the backend is unreachable
const dbOptions = { retry: false, timeout: 8000 };

// Client-side Supabase client (use anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { db: dbOptions });

// Server-side Supabase client (use service role key)
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    db: dbOptions,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
