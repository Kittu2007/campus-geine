const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyCKaupo49YRdkCOup0VtTwUyyWg2gszgMM');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
model.generateContent('hello').then(res => console.log(res.response.text())).catch(err => console.error(err));
