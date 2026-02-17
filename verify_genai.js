const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('Error: GEMINI_API_KEY is not set in .env');
        process.exit(1);
    }

    try {
        console.log('Initializing GoogleGenAI...');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        console.log('Testing generateContent...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: 'Hello, are you working?',
        });

        console.log('Response:', response.text());
        console.log('SUCCESS: @google/genai is working correctly.');
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
}

main();
