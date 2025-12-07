import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEmbeddings } from './embeddings';

// Initialize OpenRouter client (uses OpenAI-compatible API)
let openrouter: OpenAI | null = null;

// Validate and initialize OpenRouter
if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 10) {
  try {
    console.log('Initializing OpenRouter client');
    openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Optional, for including your app on openrouter.ai rankings
        'X-Title': 'Crop Disease Pest Management System' // Optional, shows in rankings
      }
    });
    console.log('✅ OpenRouter client initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize OpenRouter:', error.message);
  }
} else {
  console.log('⚠️ OpenRouter API key not configured or invalid');
}

let googleAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && process.env.GEMINI_API_KEY.length > 10) {
  try {
    console.log('Initializing Gemini AI client');
    googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI client initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
  }
} else {
  console.log('⚠️ Gemini API key not configured or using placeholder');
}

function buildPrompt(question: string, docs: Array<{id: string; score: number; metadata: Record<string, any>; text: string}>): string {
  // docs: [{id, score, metadata, text}]
  const context = docs.map((d, i) => `Source ${i+1} (${d.metadata?.source || d.id}):
${d.text.slice(0,1000)}`).join(`

`);

  // If we have relevant documents, use them specifically for the answer
  if (docs && docs.length > 0) { // Use docs if we have any relevant ones
    return `You are an assistant with access to specific agricultural documents. When answering questions, you MUST use ONLY the information provided in the following documents. If the answer cannot be found in these documents, respond with: "Based on the documents I have access to, I cannot provide specific information about this topic. However, I can share general knowledge about it." Cite sources inline using [Source X].

CONTEXT:
${context}

QUESTION: ${question}

Provide an accurate answer based ONLY on the documents above. If the information is not in the documents, acknowledge that limitation.`;
  } else {
    // If no relevant documents, allow general knowledge responses
    return `You are a helpful agricultural assistant. You can draw upon general knowledge about farming, crops, pests, and diseases to answer questions. When you do reference general knowledge, make that clear to the user.

QUESTION: ${question}

Please provide a helpful answer drawing on your general knowledge about agriculture.`;
  }
}

export async function generateAnswer(question: string, nearest: Array<{id: string; score: number; metadata: Record<string, any>; text: string}>) {
  console.log(`\n=== Generating answer for question: "${question}" ===`);
  
  try {
    // Filter out low-relevance documents
    const relevantDocs = nearest.filter(doc => doc.score > 0.5);
    console.log(`Found ${relevantDocs.length} relevant documents`);
    
    const prompt = buildPrompt(question, relevantDocs);
    console.log('Prompt built successfully');
    
    // Try OpenRouter first (using Qwen3 Coder model)
    if (openrouter) {
      let timeoutId: NodeJS.Timeout | null = null; // Declare timeoutId in outer scope
      try {
        console.log('Attempting OpenRouter with Qwen3 Coder model...');
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const completion = await openrouter.chat.completions.create({ 
          model: 'qwen/qwen3-coder:free', // Using the free Qwen3 Coder model from OpenRouter
          messages: [
            { role: 'system', content: 'You are a helpful agricultural assistant with strong coding and technical capabilities. Provide concise, accurate answers.' }, 
            { role: 'user', content: prompt }
          ], 
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9
        }, { signal: controller.signal });
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const answer = completion.choices[0].message.content?.trim() || '';
        
        // Check if the answer is empty or too short
        if (!answer || answer.length < 5) {
          throw new Error('Received empty or insufficient response from Qwen3 Coder');
        }
        const sources = relevantDocs.map((n, i) => ({ 
          id: n.metadata?.source || n.id, 
          score: n.score 
        }));
        
        console.log('✅ OpenRouter response generated successfully');
        return { answer, sources, raw: completion };
      } catch (openRouterError: any) {
        if (timeoutId) clearTimeout(timeoutId); // Ensure timeout is cleared even if an error occurs
        console.error('❌ Error generating answer with OpenRouter:', openRouterError.message);
        
        // Handle timeout specifically
        if (openRouterError.name === 'AbortError' || openRouterError.message?.includes('timeout')) {
          console.error('⏰ OpenRouter request timed out');
          throw new Error('The AI model is taking too long to respond. Please try again or use a different question.');
        }
      }
    } else {
      console.log('OpenRouter not available, skipping');
    }
    
    // Try Gemini as fallback
    if (googleAI) {
      console.log('Attempting Gemini fallback...');
      try {
        // Try different model names that are more likely to work
        const modelNames = [
          'models/gemini-2.5-flash',
          'models/gemini-1.5-flash',
          'models/gemini-pro',
          'models/gemini-1.0-pro'
        ];
        
        for (const modelName of modelNames) {
          try {
            console.log(`Attempting Gemini model: ${modelName}`);
            const model = googleAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const answer = response.text() || 'No answer generated';
            
            // Filter out low-relevance documents for sources
            const sources = relevantDocs.map((n, i) => ({ 
              id: n.metadata?.source || n.id, 
              score: n.score 
            }));
            
            console.log(`✅ Successfully generated answer with Gemini model: ${modelName}`);
            return { answer, sources, raw: response };
          } catch (modelError: any) {
            console.log(`❌ Failed with Gemini model ${modelName}:`, modelError.message.substring(0, 100));
            // Continue to next model
          }
        }
        
        // If all models fail, try a very simple approach
        console.log('All standard models failed, trying simplified approach');
        try {
          const model = googleAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
          const result = await model.generateContent(`Answer this question: ${question}`);
          const response = await result.response;
          const answer = response.text() || 'No answer generated';
          
          console.log('✅ Successfully generated answer with simplified Gemini approach');
          return { answer, sources: [], raw: response };
        } catch (simpleError: any) {
          console.log('❌ Simplified Gemini approach also failed:', simpleError.message);
        }
        
        throw new Error('All Gemini models failed');
      } catch (geminiError: any) {
        console.error('❌ Error generating answer with Gemini:', geminiError.message);
        
        // If we get here, both services failed
        let errorMessage = "I'm currently unable to access the AI service.";
        
        // Note: openRouterError is not available in this scope, so we provide a generic message
        if (openrouter) {
          errorMessage += " There was an issue with the OpenRouter service.";
        }
        
        if (geminiError.message && geminiError.message.includes('API key')) {
          errorMessage += " The Gemini API key appears to be invalid or not properly configured.";
        } else if (geminiError.message && geminiError.message.includes('404')) {
          errorMessage += " The Gemini chat models are not available with your API key. Only embedding models work.";
        } else {
          errorMessage += " The Gemini service is also unavailable.";
        }
        
        errorMessage += " Please contact the administrator to resolve these API configuration issues.";
        
        // Provide a basic response since both AI services are down
        const basicResponse = "I'm currently experiencing technical difficulties with the AI services. As a crop disease and pest management assistant, I'm designed to help farmers with agricultural questions. For immediate assistance, please contact your system administrator.";
        
        return { answer: `${errorMessage}\n\n${basicResponse}`, sources: [], raw: null };
      }
    } else {
      // Gemini not configured
      let errorMessage = "I'm currently unable to access the AI service.";
      
      // Note: openRouterError is not available in this scope, so we provide a generic message
      if (openrouter) {
        errorMessage += " There was an issue with the OpenRouter service.";
      }
      
      errorMessage += " Gemini service is not configured. Please contact the administrator.";
      
      // Provide a basic response since both AI services are down
      const basicResponse = "I'm currently experiencing technical difficulties with the AI services. As a crop disease and pest management assistant, I'm designed to help farmers with agricultural questions. For immediate assistance, please contact your system administrator.";
      
      return { answer: `${errorMessage}\n\n${basicResponse}`, sources: [], raw: null };
    }
  } catch (error: any) {
    console.error('❌ Error in generateAnswer:', error.message);
    
    // Provide a fallback response when both services are not available
    const errorMessage = "I'm currently unable to access the AI service due to a system error. Please contact the administrator.";
    const basicResponse = "I'm currently experiencing technical difficulties with the AI services. As a crop disease and pest management assistant, I'm designed to help farmers with agricultural questions. For immediate assistance, please contact your system administrator.";
    
    return { answer: `${errorMessage}\n\n${basicResponse}`, sources: [], raw: null };
  }
}