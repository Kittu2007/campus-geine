require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test with Anon key (frontend perspective)
const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testTeams() {
    console.log('Testing SELECT with Anon Key...');
    const { data: anonData, error: anonError } = await supabaseAnon.from('hackathon_teams').select('*');
    if (anonError) console.error('Anon Error:', anonError.message);
    else console.log('Anon Data Count:', anonData?.length);

    process.exit(0);
}

testTeams();
