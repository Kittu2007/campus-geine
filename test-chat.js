require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const campusInfo = require('./lib/university-context.json');

async function testChat() {
    try {
        console.log("Testing Gemini Chat with system prompt...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const systemPrompt = `You are Campus Buddy, the official AI assistant for Anurag University.
Use the UNIVERSITY DATA below to answer student questions accurately.

UNIVERSITY DATA:
${JSON.stringify(campusInfo, null, 2)}

Always be friendly and helpful.`;

        console.log("System prompt length:", systemPrompt.length, "chars");

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessageStream("who are u");

        let fullText = '';
        for await (const chunk of result.stream) {
            fullText += chunk.text();
            process.stdout.write(chunk.text());
        }
        console.log("\n\nSuccess! Response length:", fullText.length);
    } catch (e) {
        console.error("\n\nDetailed Error:", JSON.stringify(e, null, 2));
        console.error("Error message:", e?.message);
        console.error("Error status:", e?.status);
    }
}

testChat();
