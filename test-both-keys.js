const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

async function testKey(name, key) {
    console.log(`--- Testing ${name} ---`);
    console.log("Key Prefix:", key ? key.substring(0, 10) : "MISSING");

    if (!key) {
        console.error(`${name} is missing!`);
        return false;
    }

    const groq = new Groq({ apiKey: key.trim() });
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hi" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log(`SUCCESS ${name}:`, completion.choices[0].message.content.substring(0, 50));
        return true;
    } catch (e) {
        console.error(`FAILED ${name}:`, e.message);
        return false;
    }
}

async function run() {
    const key1 = process.env.GROQ_API_KEY;
    const key2 = process.env.ELIN_GROQ_API_KEY;

    await testKey("FAQ_BOT_KEY", key1);
    await testKey("ELIN_BOT_KEY", key2);
}

run();
