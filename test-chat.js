import { GoogleGenerativeAI } from '@google/generative-ai';
require('dotenv').config({ path: '.env.local' });

async function testHistory() {
    const rawKey = process.env.GEMINI_API_KEY;
    const cleanKey = rawKey ? rawKey.replace(/\s/g, '') : '';

    if (!cleanKey) {
        console.error("NO KEY");
        return;
    }

    const genAI = new GoogleGenerativeAI(cleanKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = "You are Campus Buddy.";

    const history = [
        { role: 'user', content: 'where is uni located' },
        { role: 'assistant', content: 'Anurag University is located at Venkatapur.' }
    ];
    const message = "who are you";

    let conversationContext = systemPrompt + '\n\n--- PREVIOUS CONVERSATION ---\n';
    history.slice(-6).forEach(h => {
        if (h.role && h.content) {
            conversationContext += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n`;
        }
    });

    conversationContext += `\n--- CURRENT USER MESSAGE ---\nUser: ${message}\nAssistant: `;

    console.log("PROMPT:\n", conversationContext);

    try {
        const result = await model.generateContent(conversationContext);
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("FAIL:", e.message);
    }
}

testHistory();
