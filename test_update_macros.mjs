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
    const updatedMacros = { ...(dish.macros || {}), sort_order: 5 };
    const { data: updateData, error: updateError } = await supabase.from('dishes').update({ macros: updatedMacros }).eq('id', dish.id).select();
    console.log('Update error:', updateError);
    console.log('Update data:', updateData[0].macros);
  }
}
check();
