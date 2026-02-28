const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyAWDjcKvhysGhjpL7PxeKOXgKTm0ChKrRk');

async function checkKey() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAWDjcKvhysGhjpL7PxeKOXgKTm0ChKrRk`);
        const data = await res.json();
        if (data.models) {
            console.log('Available models:', data.models.map(m => m.name).join(', '));
            console.log('Key is VALID and active.');
        } else {
            console.log('Error from API:', data);
        }
    } catch (e) {
        console.error(e);
    }
}
checkKey();
