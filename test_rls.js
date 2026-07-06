import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("=== Testing RLS Policies for Authenticated User ===");
  
  // 1. Create a dummy user
  const email = `test_${Date.now()}@test.com`;
  const password = 'testpassword123';
  
  const { data: signUpData, error: signUpError } = await sb.auth.signUp({
    email, password
  });
  
  if (signUpError) {
    console.error("SignUp Error:", signUpError);
    return;
  }
  
  console.log(`Created test user: ${signUpData.user.id}`);
  
  // 2. Try to fetch restaurants
  const { data: rData, error: rError } = await sb.from('restaurants').select('*');
  console.log("Fetch Restaurants:", rError ? `ERROR: ${rError.code} - ${rError.message}` : `OK (${rData.length} rows)`);

  // 3. Try to fetch dishes
  const { data: dData, error: dError } = await sb.from('dishes').select('*');
  console.log("Fetch Dishes:", dError ? `ERROR: ${dError.code} - ${dError.message}` : `OK (${dData.length} rows)`);

  // Cleanup (we can't delete users without service role, but it's fine)
}

run();
