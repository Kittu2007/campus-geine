const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const key = process.env.GROQ_API_KEY;
    console.log("Testing Key:", key ? (key.substring(0, 10) + "...") : "MISSING");

    if (!key) {
        console.error("GROQ_API_KEY not found in .env.local");
        return;
    }

    const groq = new Groq({ apiKey: key.trim() });
    try {
        console.log("Sending request to Groq...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("SUCCESS:", completion.choices[0].message.content);
    } catch (e) {
        console.error("FAILED:", e.message);
        if (e.status) {
            console.error("HTTP STATUS:", e.status);
        }
    }
}
test();
