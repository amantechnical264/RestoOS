import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('dishes').insert([{
    name: 'Test',
    price: 10,
    model_url: 'https://test.com/test.glb',
    rest_id: 'db6d9a26-9f89-408a-b9c1-74431a4731c5' // assuming activeRestId
  }]).select();
  console.log(error || data);
}
test();
