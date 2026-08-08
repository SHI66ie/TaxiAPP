// Supabase client for the Abuja Taxi backend
// Safe: never crashes the process if package or env vars are missing

import dotenv from 'dotenv';
dotenv.config();

let supabase = null;

try {
  // Dynamic import so missing package does not crash startup
  const supabaseModule = await import('@supabase/supabase-js').catch(() => null);
  if (supabaseModule) {
    const { createClient } = supabaseModule;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      console.warn(
        '[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Using in-memory mock store.'
      );
    }
  } else {
    console.warn('[Supabase] Package not installed. Using in-memory mock store.');
  }
} catch (err) {
  console.warn('[Supabase] Failed to initialise. Using in-memory mock store.');
}

export { supabase };
export const isSupabaseEnabled = () => Boolean(supabase);
