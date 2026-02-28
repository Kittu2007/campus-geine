require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testProfileInsert() {
    const fakeUserId = 'test-uid-from-firebase-123';
    console.log("Testing lazy profile creation for:", fakeUserId);

    const dummyEmail = `user-${fakeUserId}@campusos.internal`;

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: fakeUserId,
        email: dummyEmail
    });

    if (profileError) {
        console.error("Failed to lazy-create profile:", profileError);
    } else {
        console.log("Profile created successfully!");
        // Cleanup
        await supabaseAdmin.from('profiles').delete().eq('id', fakeUserId);
    }
    process.exit(0);
}

testProfileInsert();
