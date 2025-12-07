const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Read the test file
    const fileBuffer = fs.readFileSync('test-upload.txt');
    
    // Create FormData
    const formData = new FormData();
    formData.append('files', new Blob([fileBuffer]), 'test-upload.txt');
    
    // Send POST request
    const response = await fetch('http://localhost:3001/api/rag/ingest', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
  } catch (error) {
    console.error('Upload error:', error.message);
  }
}

testUpload();