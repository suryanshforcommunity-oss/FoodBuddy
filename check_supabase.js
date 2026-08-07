require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseUsers() {
  console.log("Checking Supabase 'users' table...");
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error("Error fetching users:", error.message);
    if (error.message.includes("relation") || error.message.includes("does not exist")) {
      console.log("\n❌ THE SQL SCRIPT WAS NOT RUN. The 'users' table does not exist.");
    }
    return;
  }
  
  console.log("✅ 'users' table exists. Current users:");
  console.log(data);
}

checkSupabaseUsers();
