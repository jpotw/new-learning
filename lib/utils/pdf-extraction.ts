import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
// In a Next.js environment, we need to set the worker path conditionally
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

/**
 * Interface for extracted PDF data
 */
export interface ExtractedPDFData {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount: number;
  };
  pages: {
    pageNumber: number;
    text: string;
  }[];
}

/**
 * Extract text and metadata from a PDF file
 * @param fileBuffer The PDF file as an ArrayBuffer
 * @returns Extracted text and metadata
 */
export async function extractPDFData(fileBuffer: ArrayBuffer): Promise<ExtractedPDFData> {
  // Load the PDF document using PDF.js
  const loadingTask = pdfjs.getDocument({ data: fileBuffer });
  const pdfDocument = await loadingTask.promise;
  
  // Extract metadata
  const metadata = await pdfDocument.getMetadata();
  
  // Extract text from each page
  const pages = [];
  const pageCount = pdfDocument.numPages;
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    pages.push({
      pageNumber: i,
      text: pageText,
    });
  }
  
  // Combine all text
  const fullText = pages.map(page => page.text).join('\n\n');
  
  // Parse dates if they exist
  let creationDate = undefined;
  let modificationDate = undefined;
  
  if (metadata.info?.CreationDate) {
    try {
      creationDate = new Date(metadata.info.CreationDate);
    } catch (e) {
      console.error('Error parsing creation date:', e);
    }
  }
  
  if (metadata.info?.ModDate) {
    try {
      modificationDate = new Date(metadata.info.ModDate);
    } catch (e) {
      console.error('Error parsing modification date:', e);
    }
  }
  
  return {
    text: fullText,
    metadata: {
      title: metadata.info?.Title,
      author: metadata.info?.Author,
      subject: metadata.info?.Subject,
      keywords: metadata.info?.Keywords,
      creator: metadata.info?.Creator,
      producer: metadata.info?.Producer,
      creationDate,
      modificationDate,
      pageCount,
    },
    pages,
  };
}

/**
 * Extract structured content from a PDF, including sections and headings
 * @param fileBuffer The PDF file as an ArrayBuffer
 * @returns Structured content with sections and headings
 */
export async function extractStructuredContent(fileBuffer: ArrayBuffer): Promise<{
  sections: { title: string; content: string; level: number }[];
  fullText: string;
}> {
  const { pages } = await extractPDFData(fileBuffer);
  const fullText = pages.map(page => page.text).join('\n\n');
  
  // Simple heuristic to identify headings and sections
  // This is a basic implementation and might need refinement for specific documents
  const lines = fullText.split('\n');
  const sections: { title: string; content: string; level: number }[] = [];
  
  let currentSection: { title: string; content: string; level: number } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Heuristic for heading detection:
    // 1. Short line (less than 100 chars)
    // 2. Ends without punctuation or ends with a colon
    // 3. All caps or first letter of each word is capitalized
    const isHeading = 
      trimmedLine.length < 100 && 
      (!/[.!?]$/.test(trimmedLine) || trimmedLine.endsWith(':')) &&
      (trimmedLine === trimmedLine.toUpperCase() || 
       /^[A-Z][a-z]*([ \t][A-Z][a-z]*)*$/.test(trimmedLine));
    
    // Determine heading level (simple heuristic based on length and capitalization)
    let level = 0;
    if (isHeading) {
      if (trimmedLine === trimmedLine.toUpperCase()) {
        level = 1; // All caps suggests a main heading
      } else if (trimmedLine.length < 50) {
        level = 2; // Shorter headings might be subheadings
      } else {
        level = 3; // Longer headings might be sub-subheadings
      }
      
      // If we have a current section, save it
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start a new section
      currentSection = {
        title: trimmedLine,
        content: '',
        level,
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    } else {
      // If we don't have a current section, create a default one
      currentSection = {
        title: 'Introduction',
        content: trimmedLine,
        level: 0,
      };
    }
  }
  
  // Add the last section if it exists
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return {
    sections,
    fullText,
  };
}

/**
 * Extract images from a PDF file
 * @param fileBuffer The PDF file as an ArrayBuffer
 * @returns Array of image data in base64 format
 */
export async function extractPDFImages(fileBuffer: ArrayBuffer): Promise<string[]> {
  // This is a placeholder for image extraction
  // PDF.js doesn't provide a straightforward way to extract images
  // For a production app, you might need a more sophisticated approach or a server-side solution
  
  console.warn('PDF image extraction is not fully implemented');
  
  // Return an empty array for now
  return [];
}

/**
 * Split a PDF into chunks for processing
 * @param fileBuffer The PDF file as an ArrayBuffer
 * @param chunkSize Number of pages per chunk
 * @returns Array of PDF chunks as ArrayBuffers
 */
export async function splitPDFIntoChunks(
  fileBuffer: ArrayBuffer, 
  chunkSize: number = 10
): Promise<ArrayBuffer[]> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pageCount = pdfDoc.getPageCount();
  const chunks: ArrayBuffer[] = [];
  
  // If the document is small enough, return it as is
  if (pageCount <= chunkSize) {
    return [fileBuffer];
  }
  
  // Split the document into chunks
  for (let i = 0; i < pageCount; i += chunkSize) {
    const chunkDoc = await PDFDocument.create();
    const endPage = Math.min(i + chunkSize, pageCount);
    
    // Copy pages from the original document
    const copiedPages = await chunkDoc.copyPages(pdfDoc, Array.from(
      { length: endPage - i }, 
      (_, index) => i + index
    ));
    
    // Add the copied pages to the new document
    copiedPages.forEach(page => {
      chunkDoc.addPage(page);
    });
    
    // Save the chunk as an ArrayBuffer
    const chunkBytes = await chunkDoc.save();
    chunks.push(chunkBytes.buffer);
  }
  
  return chunks;
} 