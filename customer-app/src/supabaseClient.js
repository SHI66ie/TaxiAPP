import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lvxlvejnkbwzxqurtopg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jXr8k8LHyZcPYRFqE9kNUg_3QfP3CFG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
