const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAWDjcKvhysGhjpL7PxeKOXgKTm0ChKrRk',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'campus-genie-a9ac8.firebaseapp.com'
});

const auth = getAuth(app);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createAdmin() {
    try {
        console.log('Creating Firebase user...');
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@anurag.edu.in', 'admin123');
        const uid = userCredential.user.uid;
        console.log('Firebase user created:', uid);

        console.log('Creating Supabase profile with admin role...');
        const { error } = await supabase.from('profiles').upsert({
            id: uid,
            email: 'admin@anurag.edu.in',
            role: 'admin',
        });

        if (error) {
            console.error('Supabase error:', error);
        } else {
            console.log('Admin account fully set up!');
        }
    } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
            console.log('Admin account already exists in Firebase. Attempting to force admin role in Supabase...');
            // We can't get the UID directly if creation fails, so we search Supabase by email
            const { data } = await supabase.from('profiles').select('id').eq('email', 'admin@anurag.edu.in').single();
            if (data) {
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.id);
                console.log('Admin role updated in Supabase.');
            }
        } else {
            console.error('Firebase error:', e.message);
        }
    }
    process.exit(0);
}

createAdmin();
