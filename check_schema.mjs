import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

// I need to read the env variables from .env if possible
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf-8');
const envUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1];
const envKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1];

const supabase = createClient(envUrl, envKey);

async function check() {
  const { data, error } = await supabase.from('dishes').select('*').limit(1);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  } else {
    console.log('No data or error:', error);
  }
}
check();
