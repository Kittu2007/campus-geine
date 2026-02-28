require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
    console.log('Testing complaints insert...');
    // We'll use a dummy un-synced user_id
    const fakeUserId = 'not-in-profiles-123';

    const { data, error } = await supabase.from('complaints').insert({
        user_id: fakeUserId,
        category: 'other',
        room_no: 'test',
        description: 'test description',
        status: 'pending'
    });

    console.log('Insert attempt error:', error?.message || 'Success');
    if (error) console.error(error);
    else console.log('Data:', data);

    process.exit(0);
}

testInsert();
