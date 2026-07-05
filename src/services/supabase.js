import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Automatically detect & exchange OAuth code/token from URL after email link clicks
      detectSessionInUrl: true,
      // PKCE is the most secure flow for SPAs — required for proper email link handling
      flowType: 'pkce',
      // Persist session across page refreshes
      persistSession: true,
      // Use localStorage for session storage
      storage: window.localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
      heartbeatIntervalMs: 15000,
      reconnectAfterMs: (tries) => Math.min(1000 * tries, 10000),
      timeout: 10000,
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
  });
} else {
  console.warn("Supabase credentials missing. App needs Supabase to function correctly.");
}

export { supabase };
