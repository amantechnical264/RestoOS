import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
