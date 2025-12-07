import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VectorItem {
  id: string;
  values: number[];
  metadata: Record<string, any>;
  text: string;
}

// Persistent storage file path
const VECTOR_STORE_FILE = path.join(__dirname, '..', '..', 'data', 'vectorstore.json');

// Ensure data directory exists
const dataDir = path.dirname(VECTOR_STORE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load vector store from disk or initialize empty array
let vectorStore: VectorItem[] = [];

function loadVectorStore(): VectorItem[] {
  try {
    if (fs.existsSync(VECTOR_STORE_FILE)) {
      const data = fs.readFileSync(VECTOR_STORE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading vector store from disk:', error);
  }
  return [];
}

function saveVectorStore(): void {
  try {
    fs.writeFileSync(VECTOR_STORE_FILE, JSON.stringify(vectorStore, null, 2));
  } catch (error) {
    console.error('Error saving vector store to disk:', error);
  }
}

// Load existing data on startup
vectorStore = loadVectorStore();

export async function upsertVectors(items: VectorItem[]): Promise<void> {
  try {
    console.log(`Upserting ${items.length} vectors`);
    
    // Validate items
    const validItems = items.filter(item => 
      item.id && 
      item.values && 
      Array.isArray(item.values) && 
      item.values.length > 0 &&
      !item.values.every(val => val === 0) // Reject all-zero vectors
    );
    
    if (validItems.length !== items.length) {
      console.warn(`Filtered out ${items.length - validItems.length} invalid items`);
    }
    
    if (validItems.length === 0) {
      console.warn('No valid items to upsert');
      return;
    }
    
    // For simplicity, we're just replacing items with the same ID
    // In a real implementation, you'd want to properly upsert
    for (const item of validItems) {
      // Validate the vector
      if (!item.values || item.values.length === 0) {
        console.warn(`Skipping item ${item.id} with empty vector`);
        continue;
      }
      
      // Check if all values are zero (invalid embedding)
      if (item.values.every(val => val === 0)) {
        console.warn(`Skipping item ${item.id} with all-zero vector`);
        continue;
      }
      
      const existingIndex = vectorStore.findIndex(v => v.id === item.id);
      if (existingIndex >= 0) {
        vectorStore[existingIndex] = item;
        console.log(`Updated existing vector ${item.id}`);
      } else {
        vectorStore.push(item);
        console.log(`Added new vector ${item.id}`);
      }
    }
    
    // Persist to disk
    console.log('Saving vector store to disk');
    saveVectorStore();
    
    console.log(`Upserted ${validItems.length} vectors. Total vectors: ${vectorStore.length}`);
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw new Error(`Failed to upsert vectors: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Improved cosine similarity calculation with better error handling
function cosineSimilarity(a: number[], b: number[]): number {
  // Handle edge cases
  if (!a || !b || a.length === 0 || b.length === 0) {
    console.warn('Cosine similarity: Empty vectors provided');
    return 0;
  }
  
  if (a.length !== b.length) {
    console.warn('Cosine similarity: Vectors have different lengths:', a.length, b.length);
    // Use the minimum length to avoid errors
    const minLength = Math.min(a.length, b.length);
    a = a.slice(0, minLength);
    b = b.slice(0, minLength);
    
    if (a.length === 0 || b.length === 0) {
      console.warn('Cosine similarity: Vectors became empty after truncation');
      return 0;
    }
  }
  
  // Check for all-zero vectors
  const isZeroVectorA = a.every(val => val === 0);
  const isZeroVectorB = b.every(val => val === 0);
  
  if (isZeroVectorA || isZeroVectorB) {
    console.warn('Cosine similarity: Zero vector detected');
    return 0;
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    console.warn('Cosine similarity: Zero magnitude detected');
    return 0;
  }
  
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  // Validate result
  if (isNaN(similarity) || !isFinite(similarity)) {
    console.warn('Cosine similarity: Invalid result computed');
    return 0;
  }
  
  // Clamp to [-1, 1] range
  return Math.max(-1, Math.min(1, similarity));
}

export async function queryVectors(embedding: number[], topK: number = 5): Promise<Array<{ id: string; score: number; metadata: Record<string, any>; text: string }>> {
  try {
    console.log(`Querying vector store with embedding of length ${embedding.length}`);
    
    // Handle case when vector store is empty
    if (vectorStore.length === 0) {
      console.log('Vector store is empty');
      return [];
    }
    
    console.log(`Computing similarities against ${vectorStore.length} stored vectors`);
    
    // Calculate similarity scores for all vectors
    const similarities = vectorStore.map(item => ({
      item,
      score: cosineSimilarity(embedding, item.values)
    }));
    
    // Filter out very low similarity scores
    const relevantSimilarities = similarities.filter(({ score }) => score > 0.1);
    console.log(`Found ${relevantSimilarities.length} vectors with similarity > 0.1`);
    
    // Sort by score descending and take topK
    relevantSimilarities.sort((a, b) => b.score - a.score);
    const topMatches = relevantSimilarities.slice(0, topK);
    
    console.log(`Top ${topMatches.length} matches:`);
    topMatches.forEach((match, i) => {
      console.log(`  ${i+1}. Score: ${match.score.toFixed(4)}, Source: ${match.item.metadata?.source || 'unknown'}`);
    });
    
    // Return the formatted results
    return topMatches.map(({ item, score }) => ({
      id: item.id,
      score,
      metadata: item.metadata,
      text: item.text
    }));
  } catch (error) {
    console.error('Error querying vectors:', error);
    throw new Error(`Failed to query vectors: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Utility function to clear the vector store (useful for testing)
export function clearVectorStore(): void {
  vectorStore = [];
  saveVectorStore();
}