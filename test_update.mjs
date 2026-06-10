import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf-8');
const envUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1];
const envKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1];

const supabase = createClient(envUrl, envKey);

async function check() {
  const { data, error } = await supabase.from('dishes').select('*').limit(1);
  if (data && data.length > 0) {
    const dish = data[0];
    const { error: updateError } = await supabase.from('dishes').update({ sort_order: 1 }).eq('id', dish.id);
    console.log('Update error:', updateError);
  }
}
check();
