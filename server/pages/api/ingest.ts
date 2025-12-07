import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { extractTextFromFile } from '../../utils/textExtractors';
import { chunkText } from '../../scripts/chunker';
import { getEmbeddings } from '../../lib/embeddings';
import { upsertVectors } from '../../lib/vectorstore';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware to handle multipart/form-data
const uploadMiddleware = upload.array('files');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: Request, res: Response) {
  console.log('=== RAG Document Ingestion Started ===');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Wrap multer middleware in a promise
  const multerPromise = new Promise((resolve, reject) => {
    uploadMiddleware(req as any, res as any, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });

  try {
    await multerPromise;
    
    const files = (req as any).files;
    if (!files || files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`Processing ${files.length} uploaded files`);
    const fileList = Array.isArray(files) ? files : [files];
    const allChunks: Array<{ id: string; text: string; metadata: Record<string, any> }> = [];

    for (const file of fileList) {
      console.log(`Processing file: ${file.originalname}`);
      const id = nanoid();
      const buffer = fs.readFileSync(file.path);
      
      // Extract text from file
      console.log('Extracting text from file');
      const { text } = await extractTextFromFile(buffer, file.originalname);
      
      if (!text || text.trim().length === 0) {
        console.warn(`Warning: No text extracted from file ${file.originalname}`);
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        continue;
      }
      
      console.log(`Extracted ${text.length} characters from ${file.originalname}`);
      
      // Chunk the text
      const chunks = chunkText(text, { chunkSize: 800, chunkOverlap: 120 });
      console.log(`Split text into ${chunks.length} chunks`);
      
      if (chunks.length === 0) {
        console.warn(`Warning: No chunks created from file ${file.originalname}`);
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        continue;
      }
      
      // Attach metadata
      const chunksWithMeta = chunks.map((c, i) => ({
        id: `${id}_${i}`,
        text: c,
        metadata: { 
          source: file.originalname, 
          page: null 
        }
      }));
      
      allChunks.push(...chunksWithMeta);
      
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      console.log(`Processed file ${file.originalname} successfully`);
    }
    
    if (allChunks.length === 0) {
      console.log('No valid chunks to process');
      return res.status(400).json({ 
        error: 'No valid content found in uploaded files',
        message: 'No valid content found in uploaded files'
      });
    }

    console.log(`Creating embeddings for ${allChunks.length} chunks`);
    // Create embeddings in batches
    const texts = allChunks.map(c => c.text);
    
    // Validate texts before embedding
    const validTexts = texts.filter(t => t && t.trim().length > 0);
    if (validTexts.length === 0) {
      throw new Error('No valid text content to embed');
    }
    
    console.log(`Generating embeddings for ${validTexts.length} valid texts`);
    const embeddings = await getEmbeddings(validTexts);
    
    if (!embeddings || embeddings.length === 0) {
      throw new Error('Failed to generate embeddings');
    }
    
    console.log(`Generated ${embeddings.length} embeddings`);
    
    const items = allChunks.map((c, i) => ({
      id: c.id,
      values: embeddings[i],
      metadata: c.metadata,
      text: c.text
    }));

    console.log(`Upserting ${items.length} vectors to vector store`);
    await upsertVectors(items);
    
    console.log('=== RAG Document Ingestion Completed Successfully ===');
    res.json({ 
      ok: true, 
      inserted: items.length,
      message: `Successfully ingested ${items.length} document chunks`
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    console.error('=== RAG Document Ingestion FAILED ===');
    res.status(500).json({ 
      error: error.message || 'Failed to ingest documents',
      message: 'Document ingestion failed: ' + (error.message || 'Unknown error')
    });
  }
}