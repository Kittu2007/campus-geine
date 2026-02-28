require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixTeams() {
    console.log('Restoring missing teams...');
    const { data, error } = await supabase
        .from('hackathon_teams')
        .update({ status: 'open' })
        .is('status', null)
        .select();

    if (error) {
        console.error('Error fixing teams:', error);
    } else {
        console.log(`Successfully fixed ${data.length} teams that were previously hidden!`);
    }
    process.exit(0);
}

fixTeams();
