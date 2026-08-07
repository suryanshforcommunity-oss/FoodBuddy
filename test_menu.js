require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMenu() {
  const { data, error } = await supabase.from('weekly_menu').select('*').limit(5);
  console.log(data);
}

checkMenu();
