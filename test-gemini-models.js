const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyCKaupo49YRdkCOup0VtTwUyyWg2gszgMM');

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCKaupo49YRdkCOup0VtTwUyyWg2gszgMM`);
        const data = await response.json();
        console.log(data.models.map(m => m.name).join('\n'));
    } catch (err) {
        console.error(err);
    }
}

listModels();
