/**
 * Utility functions for processing text for Gemini API interactions
 */

/**
 * Truncate text to a maximum length to avoid token limits
 * @param text The text to truncate
 * @param maxLength Maximum length in characters
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 100000): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Split a long document into chunks that can be processed by the API
 * @param text The document text to split
 * @param chunkSize Maximum size of each chunk
 * @param overlap Number of characters to overlap between chunks
 * @returns Array of text chunks
 */
export function splitIntoChunks(
  text: string, 
  chunkSize: number = 10000, 
  overlap: number = 500
): string[] {
  const chunks: string[] = [];
  
  if (text.length <= chunkSize) {
    chunks.push(text);
    return chunks;
  }
  
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate end index for this chunk
    let endIndex = startIndex + chunkSize;
    
    // If we're not at the end of the text, try to find a good break point
    if (endIndex < text.length) {
      // Look for paragraph breaks, sentence breaks, or word breaks
      const paragraphBreak = text.lastIndexOf('\n\n', endIndex);
      const sentenceBreak = text.lastIndexOf('. ', endIndex);
      const wordBreak = text.lastIndexOf(' ', endIndex);
      
      // Use the closest break point that's not too far back
      if (paragraphBreak > startIndex && paragraphBreak > endIndex - 500) {
        endIndex = paragraphBreak + 2; // Include the paragraph break
      } else if (sentenceBreak > startIndex && sentenceBreak > endIndex - 300) {
        endIndex = sentenceBreak + 2; // Include the period and space
      } else if (wordBreak > startIndex && wordBreak > endIndex - 100) {
        endIndex = wordBreak + 1; // Include the space
      }
    }
    
    // Add this chunk to our array
    chunks.push(text.substring(startIndex, endIndex));
    
    // Move start index for next chunk, accounting for overlap
    startIndex = endIndex - overlap;
    
    // Make sure we're making progress
    if (startIndex >= text.length || endIndex <= startIndex) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Extract the most relevant sections of a document based on a query
 * @param documentText The full document text
 * @param query The user's query
 * @param maxContextLength Maximum context length to return
 * @returns The most relevant sections of the document
 */
export function extractRelevantContext(
  documentText: string,
  query: string,
  maxContextLength: number = 10000
): string {
  // Simple keyword-based relevance for now
  // In a real implementation, this could use embeddings or more sophisticated techniques
  
  // Split the document into paragraphs
  const paragraphs = documentText.split(/\n\s*\n/);
  
  // Extract keywords from the query (simple approach)
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Only consider words longer than 3 chars
  
  // Score paragraphs based on keyword matches
  const scoredParagraphs = paragraphs.map(paragraph => {
    const paragraphLower = paragraph.toLowerCase();
    let score = 0;
    
    // Count keyword occurrences
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = paragraphLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    
    return { paragraph, score };
  });
  
  // Sort by score (highest first)
  scoredParagraphs.sort((a, b) => b.score - a.score);
  
  // Take the top paragraphs until we reach maxContextLength
  let context = '';
  let currentLength = 0;
  
  for (const { paragraph, score } of scoredParagraphs) {
    // Only include paragraphs with some relevance
    if (score === 0) continue;
    
    if (currentLength + paragraph.length + 2 <= maxContextLength) {
      context += paragraph + '\n\n';
      currentLength += paragraph.length + 2;
    } else {
      // If the next paragraph would exceed the limit, stop
      break;
    }
  }
  
  return context.trim();
}

/**
 * Clean and format the AI response for display
 * @param response The raw response from the AI
 * @returns Cleaned and formatted response
 */
export function formatAIResponse(response: string): string {
  // Remove any system prompts or artifacts that might have been included
  let cleaned = response.replace(/^(As an AI|I am an AI|As a language model).+?\n/i, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Prepare a document for AI processing by cleaning and normalizing the text
 * @param text Raw document text
 * @returns Cleaned and normalized text
 */
export function prepareDocumentText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, '\n');
  
  // Remove any control characters
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return cleaned;
} 