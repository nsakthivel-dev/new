import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Dotenv result:', result);
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);