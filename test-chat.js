require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testChat() {
    try {
        console.log("Testing Gemini Chat API directly...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: "Hi" }] },
                { role: 'model', parts: [{ text: "Hello! How can I help you today?" }] }
            ]
        });

        console.log("Sending message: 'What are the library timings?'");
        const result = await chat.sendMessageStream("What are the library timings?");

        for await (const chunk of result.stream) {
            process.stdout.write(chunk.text());
        }
        console.log("\n\nSuccess!");
    } catch (e) {
        console.error("\n\nDetailed Error API:", e);
    }
}

testChat();
