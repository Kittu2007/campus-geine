require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testComplaints() {
    console.log('Testing complaints table join...');
    const { data: joinData, error: joinError } = await supabase
        .from('complaints')
        .select('*, profiles:user_id(display_name, email)')
        .limit(1);

    console.log('Join attempt error:', joinError?.message || 'Success');
    if (joinError) console.error(joinError);
    else console.log('Data:', joinData);

    process.exit(0);
}

testComplaints();
