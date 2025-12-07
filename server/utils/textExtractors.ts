import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<{ text: string; pages: any }> {
  console.log(`Extracting text from file: ${filename}`);
  
  try {
    if (filename.endsWith('.pdf')) {
      console.log('Processing PDF file');
      const data = await (pdfParse as any)(buffer);
      const text = data.text || '';
      console.log(`Extracted ${text.length} characters from PDF`);
      return { text, pages: null };
    } else if (filename.endsWith('.docx')) {
      console.log('Processing DOCX file');
      // For DOCX files, we need to write to a temporary file first
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      console.log(`Extracted ${text.length} characters from DOCX`);
      return { text, pages: null };
    } else {
      console.log('Processing as plain text file');
      // fallback: treat as UTF-8 text
      const text = buffer.toString('utf8');
      console.log(`Extracted ${text.length} characters from text file`);
      return { text, pages: null };
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${filename}: ${error instanceof Error ? error.message : String(error)}`);
  }
}