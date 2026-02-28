require('dotenv').config({ path: '.env.local' });

async function listFreeModels() {
    const cleanKey = (process.env.OPENROUTER_API_KEY || '').replace(/\s/g, '');

    const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
    });
    const data = await res.json();

    // Filter for free models
    const freeModels = data.data?.filter(m =>
        m.id.includes(':free') || (m.pricing?.prompt === '0' && m.pricing?.completion === '0')
    ) || [];

    console.log(`Found ${freeModels.length} free models:\n`);
    freeModels.forEach(m => {
        console.log(`- ${m.id} (context: ${m.context_length})`);
    });
}

listFreeModels().catch(console.error);
