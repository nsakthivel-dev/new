import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromFile } from './server/utils/textExtractors';
import { chunkText } from './server/scripts/chunker';
import { getEmbeddings } from './server/lib/embeddings';
import { upsertVectors, queryVectors, clearVectorStore } from './server/lib/vectorstore';
import { generateAnswer } from './server/lib/retriever';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRAGFlow() {
  console.log('=== RAG Flow Test Started ===');
  
  try {
    // Clear existing vector store
    console.log('Clearing vector store...');
    clearVectorStore();
    
    // 1. Test document ingestion
    console.log('\n1. Testing document ingestion...');
    
    // Create a test document
    const testDocumentPath = path.join(__dirname, 'test-document.txt');
    if (!fs.existsSync(testDocumentPath)) {
      const testContent = `Crop Disease Management Guide

Tomato Blight Prevention
Tomato blight is a common fungal disease that affects tomato plants. To prevent blight:
1. Water at the base of plants, not on leaves
2. Space plants adequately for air circulation
3. Remove infected leaves immediately
4. Apply fungicide as preventive measure
5. Rotate crops annually

Common Tomato Pests
1. Aphids - Small green insects that suck plant juices
2. Hornworms - Large green caterpillars with horn-like projection
3. Whiteflies - Tiny white insects that fly when disturbed

Preventive Measures
- Maintain soil pH between 6.0-6.8
- Use mulch to prevent soil-borne diseases
- Encourage beneficial insects like ladybugs
- Practice crop rotation`;
      
      fs.writeFileSync(testDocumentPath, testContent);
      console.log('Created test document');
    }
    
    // Read and process the document
    const buffer = fs.readFileSync(testDocumentPath);
    const { text } = await extractTextFromFile(buffer, 'test-document.txt');
    
    if (!text || text.trim().length === 0) {
      throw new Error('Failed to extract text from test document');
    }
    
    console.log(`Extracted ${text.length} characters`);
    
    // Chunk the text
    const chunks = chunkText(text, { chunkSize: 300, chunkOverlap: 50 });
    console.log(`Created ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      throw new Error('No chunks created from text');
    }
    
    // Create embeddings
    console.log('Generating embeddings...');
    const embeddings = await getEmbeddings(chunks);
    
    if (!embeddings || embeddings.length === 0) {
      throw new Error('Failed to generate embeddings');
    }
    
    console.log(`Generated ${embeddings.length} embeddings`);
    
    // Validate embeddings
    const validEmbeddings = embeddings.filter(emb => emb && emb.length > 0 && !emb.every(val => val === 0));
    if (validEmbeddings.length !== embeddings.length) {
      console.warn(`Warning: ${embeddings.length - validEmbeddings.length} invalid embeddings filtered out`);
    }
    
    if (validEmbeddings.length === 0) {
      throw new Error('No valid embeddings generated');
    }
    
    // Create vector items
    const items = chunks.map((chunk, i) => ({
      id: `test_doc_${i}`,
      values: validEmbeddings[i],
      metadata: { 
        source: 'test-document.txt',
        chunkIndex: i
      },
      text: chunk
    }));
    
    // Upsert vectors
    console.log('Upserting vectors...');
    await upsertVectors(items);
    
    // 2. Test querying
    console.log('\n2. Testing query functionality...');
    
    const testQueries = [
      "How do I prevent tomato blight?",
      "What are common tomato pests?",
      "How should I water my tomato plants?"
    ];
    
    for (const query of testQueries) {
      console.log(`\nTesting query: "${query}"`);
      
      // Generate query embedding
      const qEmb = await getEmbeddings([query]);
      
      if (!qEmb || qEmb.length === 0) {
        console.log('Failed to generate query embedding');
        continue;
      }
      
      // Query vectors
      const results = await queryVectors(qEmb[0], 3);
      console.log(`Found ${results.length} relevant chunks`);
      
      // Generate answer
      console.log('Generating answer...');
      const answer = await generateAnswer(query, results);
      console.log(`Answer: ${answer.answer.substring(0, 100)}...`);
    }
    
    console.log('\n=== RAG Flow Test Completed Successfully ===');
    
  } catch (error) {
    console.error('RAG Flow Test Failed:', error);
    console.error('=== RAG Flow Test FAILED ===');
  }
}

// Run the test
testRAGFlow();