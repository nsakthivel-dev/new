// Test if environment variables are loaded before importing the app
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'LOADED' : 'NOT LOADED');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'LOADED' : 'NOT LOADED');

// Now import the app
import('./server/app.ts').then(() => {
  console.log('App imported successfully');
}).catch((error) => {
  console.error('Error importing app:', error);
});