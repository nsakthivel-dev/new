const fs = require('fs');
const path = require('path');

// Simple test to check if we can read the test file
try {
  const content = fs.readFileSync('test-upload.txt', 'utf8');
  console.log('File content:', content);
} catch (error) {
  console.error('Error reading file:', error.message);
}