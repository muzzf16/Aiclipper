import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log('❌ GEMINI_API_KEY missing');
            return;
        }
        console.log('🔑 Key present:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

        // 1. List Models via REST
        console.log('\n📋 Fetching models list...');
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log('✅ Found ' + data.models.length + ' models. Top 5:');
            data.models.slice(0, 5).forEach(m => console.log(`   - ${m.name}`));

            // Check for specific models
            const hasFlash = data.models.some(m => m.name.includes('flash'));
            const hasPro = data.models.some(m => m.name.includes('pro'));
            console.log(`   - Has Flash? ${hasFlash}`);
            console.log(`   - Has Pro? ${hasPro}`);
        } else {
            console.log('❌ No models found or error:', data);
        }

        // 2. Test Generation
        console.log('\n🧪 Testing Generation with gemini-2.5-flash...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent('Hello');
            console.log('✅ gemini-2.5-flash worked!');
        } catch (e) {
            console.log('❌ gemini-2.5-flash failed:', e.message);
        }

    } catch (e) {
        console.error('❌ Script error:', e);
    }
}

check();
