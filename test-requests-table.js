require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRequests() {
    console.log('Testing team_requests table...');
    const { data: teams, error: e1 } = await supabase.from('hackathon_teams').select('id').limit(1);
    const teamId = teams?.[0]?.id;
    if (!teamId) return console.log('No team found.', e1);

    // Try dummy insert (will fail due to bad requester_id, but the error will tell us if foreign key is missing)
    const { data, error } = await supabase.from('team_requests').insert({
        team_id: teamId,
        requester_id: 'dummy_id',
        message: 'Hello'
    });

    console.log('Insert attempt:', error?.message || 'Success');

    // Try join query
    const { data: joinData, error: joinError } = await supabase
        .from('team_requests')
        .select('*, profiles:requester_id(display_name, email)')
        .limit(1);

    console.log('Join attempt:', joinError?.message || 'Success');

    process.exit(0);
}

testRequests();
