require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testJoin() {
    console.log('Testing join...');
    const { data, error } = await supabase
        .from('hackathon_teams')
        .select('*, profiles:creator_id(display_name, email)')
        .eq('status', 'open');

    if (error) console.error('Join Error:', error);
    else console.log('Joined Data:', JSON.stringify(data, null, 2));

    process.exit(0);
}

testJoin();
