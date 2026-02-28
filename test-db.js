const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    // Check buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log("Buckets:", buckets?.map(b => b.name), bucketError);

    // Check schema
    const { data, error } = await supabase.from('complaints').select('*').limit(1);
    console.log("Complaints table ready:", !!data, error);
}

check();
