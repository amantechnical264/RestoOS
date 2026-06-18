import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPromo() {
  console.log("Checking restaurants table...");
  const { data, error } = await supabase.from('restaurants').select('*').limit(1);
  if (error) {
    console.error("Error fetching restaurants:", error);
  } else {
    console.log("Restaurant data:", data);
  }
}

checkPromo();
