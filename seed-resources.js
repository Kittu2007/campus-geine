require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedResources() {
    console.log('Fetching admin user ID...');
    const { data: adminData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'admin@anurag.edu.in')
        .single();

    const adminId = adminData ? adminData.id : null;

    const resources = [
        {
            title: "Data Structures in C - Handwritten Notes",
            subject: "Data Structures",
            type: "link",
            url: "https://www.scribd.com/document/729849068/DSA-in-C-Notes-Handwritten",
            description: "Comprehensive handwritten notes for Data Structures using C.",
            uploaded_by: adminId
        },
        {
            title: "Applied Physics Consolidated Notes",
            subject: "Physics",
            type: "pdf",
            url: "https://bmsce.ac.in/Content/PHY/Applied_physics_consolidated_notes.pdf",
            description: "Consolidated study material for Applied Physics.",
            uploaded_by: adminId
        }
    ];

    console.log('Inserting resources into the database...');
    const { error, data } = await supabase.from('resources').insert(resources).select();

    if (error) {
        console.error('Failed to insert resources:', error.message);
    } else {
        console.log(`Successfully added ${data.length} resources!`);
    }
    process.exit(0);
}

seedResources();
