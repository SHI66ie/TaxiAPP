// Supabase client for the Admin Dashboard (browser-safe)
// Safe: never crashes if package or env vars are missing

let supabase = null;

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    // Static import is fine here because Vite resolves it at build time.
    // We still guard so the rest of the app works without keys.
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn(
      '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Realtime features disabled.'
    );
  }
} catch (err) {
  console.warn('[Supabase] Package not available. Continuing without Supabase.');
}

export { supabase };
export const isSupabaseEnabled = () => Boolean(supabase);
