import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[northi] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. Admin sign-in will not work ' +
      'until these are configured — see .env.example.'
  );
}

// Browser client used for the admin login form. The anon key is safe to
// ship to the client — it only grants access allowed by Supabase's own
// row-level security / auth rules, never the service-role key.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
