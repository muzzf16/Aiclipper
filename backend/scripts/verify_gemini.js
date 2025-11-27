import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Checking key:', key ? key.substring(0, 10) + '...' : 'MISSING');

    if (!key) {
        console.error('❌ No API key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    const modelName = 'gemini-1.5-flash';

    try {
        console.log(`Attempting to generate content with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        console.log('✅ Success! Response:', response.text());
    } catch (error) {
        console.error('❌ Error Message:', error.message);
        // Log the full error object if possible
        if (error.response) {
            console.error('❌ Error Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

verify();
