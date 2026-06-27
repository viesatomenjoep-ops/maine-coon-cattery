const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: cats, error: catsError } = await supabase.from('cats').select('*');
  console.log('Cats:', cats ? cats.length : null, catsError);
  
  const { data: litters, error: littersError } = await supabase.from('litters').select('*');
  console.log('Litters:', litters ? litters.length : null, littersError);
}

test();
