export function chunkText(text: string, options: { chunkSize?: number; chunkOverlap?: number } = {}): string[] {
  const { chunkSize = 800, chunkOverlap = 120 } = options;
  
  console.log(`Chunking text of length ${text.length} with chunkSize=${chunkSize}, chunkOverlap=${chunkOverlap}`);
  
  // Handle empty or very short text
  if (!text || text.length === 0) {
    console.log('Empty text, returning empty chunks');
    return [];
  }
  
  // If text is shorter than chunk size, return as single chunk
  if (text.length <= chunkSize) {
    console.log('Text shorter than chunk size, returning as single chunk');
    return [text];
  }
  
  const out: string[] = [];
  let start = 0;
  let chunkCount = 0;
  
  while (start < text.length && chunkCount < 100) { // Safety limit
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    // Skip empty chunks
    if (chunk.trim().length > 0) {
      out.push(chunk);
      chunkCount++;
      console.log(`Created chunk ${chunkCount} with length ${chunk.length}`);
    }
    
    start = end - chunkOverlap;
    
    // Prevent infinite loop and negative start values
    if (start < 0) start = 0;
    
    // If we've reached the end, break
    if (end >= text.length) break;
    
    // If start hasn't advanced, move it forward to avoid infinite loop
    if (start <= end - chunkSize + chunkOverlap) {
      start = end;
    }
  }
  
  console.log(`Created ${out.length} chunks total`);
  return out;
}