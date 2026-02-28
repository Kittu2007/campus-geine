require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const campusInfo = require('./lib/university-context.json');

async function testChat() {
    const rawKey = process.env.GEMINI_API_KEY || '';
    const cleanKey = rawKey.replace(/\s/g, '');
    console.log("Key present:", !!cleanKey, "Key length:", cleanKey.length);

    try {
        const genAI = new GoogleGenerativeAI(cleanKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: 'You are Campus Buddy for Anurag University.',
            generationConfig: { maxOutputTokens: 800 }
        });

        const result = await model.generateContent("What are the library timings?");
        const response = await result.response;

        const text =
            response?.candidates?.[0]?.content?.parts
                ?.map(p => p.text)
                ?.filter(Boolean)
                ?.join(' ') || 'No response generated.';

        console.log("SUCCESS! Response:", text.substring(0, 200));
        return JSON.stringify({ success: true, message: text });
    } catch (e) {
        console.error("ERROR:", e?.message, "Status:", e?.status);
        return JSON.stringify({ success: false, error: e?.message });
    }
}

testChat().then(r => console.log("\nFull JSON response:\n", r));
