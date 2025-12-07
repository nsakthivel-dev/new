import { Request, Response } from 'express';
import { getEmbeddings } from '../../lib/embeddings';
import { queryVectors } from '../../lib/vectorstore';
import { generateAnswer } from '../../lib/retriever';

export default async function handler(req: Request, res: Response) {
  console.log('=== RAG Question Answering Started ===');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { query, topK = 5 } = req.body;
  
  if (!query) {
    console.log('Missing query parameter');
    return res.status(400).json({ error: 'Missing query' });
  }
  
  console.log(`Processing query: "${query}" with topK=${topK}`);
  
  try {
    console.log('Generating embeddings for query');
    const qEmb = await getEmbeddings([query]);
    
    // Check if we got embeddings successfully
    if (!qEmb || qEmb.length === 0) {
      throw new Error('Failed to generate embeddings for the query');
    }
    
    console.log('Querying vector database for relevant documents');
    const nearest = await queryVectors(qEmb[0], topK);
    
    console.log(`Found ${nearest.length} relevant documents`);
    // Log top matches for debugging
    nearest.slice(0, 3).forEach((doc, i) => {
      console.log(`Match ${i+1}: Score=${doc.score.toFixed(4)}, Source=${doc.metadata?.source || 'unknown'}`);
    });
    
    // nearest: [{ id, score, metadata, text }]
    console.log('Generating answer with retrieved context');
    const answerObj = await generateAnswer(query, nearest);
    
    console.log('=== RAG Question Answering Completed Successfully ===');
    res.json(answerObj);
  } catch (error: any) {
    console.error('QA error:', error);
    console.error('=== RAG Question Answering FAILED ===');
    
    // Provide more specific error messages based on the type of error
    let userMessage = "Sorry, I'm having trouble answering your question right now.";
    
    if (error.message && error.message.includes('quota')) {
      userMessage = 'The AI service is temporarily unavailable due to usage limits. Please try again later or ask a different question.';
    } else if (error.message && error.message.includes('API key')) {
      userMessage = 'The AI service is not properly configured. Please contact the administrator.';
    } else if (error.message) {
      userMessage = `I encountered an issue: ${error.message}`;
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to generate answer',
      message: userMessage
    });
  }
}