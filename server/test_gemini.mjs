import axios from 'axios';
import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;
const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];

for (const model of models) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const r = await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: 'Reply with just the word: OK' }] }]
    }, { headers: { 'Content-Type': 'application/json' } });
    console.log(`✅ [${model}]: ${r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
  } catch (e) {
    const status = e.response?.status;
    const msg = e.response?.data?.error?.message?.split('\n')[0] || e.message;
    console.log(`❌ [${model}]: ${status} - ${msg}`);
  }
}
