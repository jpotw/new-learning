'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { 
  extractPDFData, 
  extractStructuredContent,
  splitPDFIntoChunks 
} from '@/lib/utils/pdf-extraction';
import { 
  generateResponse, 
  generateSummary 
} from '@/lib/gemini/client';
import { 
  extractRelevantContext, 
  prepareDocumentText, 
  truncateText 
} from '@/lib/gemini/text-processing';

/**
 * Interface for document metadata
 */
export interface DocumentMetadata {
  id: string;
  title: string;
  author?: string;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Upload a PDF document to the database
 */
export async function uploadPDF(formData: FormData): Promise<{ 
  success: boolean; 
  documentId?: string; 
  error?: string;
}> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { success: false, error: 'File must be a PDF' };
    }
    
    // Get file buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Extract PDF data
    const pdfData = await extractPDFData(fileBuffer);
    
    // Create Supabase client
    const supabase = createClient(cookies());
    
    // Generate a title if none exists
    const title = pdfData.metadata.title || file.name.replace('.pdf', '');
    
    // Upload file to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(`pdfs/${Date.now()}_${file.name}`, file);
    
    if (storageError) {
      console.error('Error uploading file to storage:', storageError);
      return { success: false, error: 'Error uploading file' };
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(storageData.path);
    
    // Insert document metadata into database
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        title,
        file_path: publicUrl,
        file_size: file.size,
        file_type: file.type,
        page_count: pdfData.metadata.pageCount,
        author: pdfData.metadata.author,
        created_date: pdfData.metadata.creationDate,
        modified_date: pdfData.metadata.modificationDate,
        content_text: truncateText(pdfData.text, 1000000), // Limit text size for database
      })
      .select('id')
      .single();
    
    if (documentError) {
      console.error('Error inserting document metadata:', documentError);
      return { success: false, error: 'Error saving document metadata' };
    }
    
    // Process document pages
    const pageInserts = pdfData.pages.map((page) => ({
      document_id: documentData.id,
      page_number: page.pageNumber,
      content_text: page.text,
    }));
    
    // Insert pages in batches to avoid hitting database limits
    const batchSize = 50;
    for (let i = 0; i < pageInserts.length; i += batchSize) {
      const batch = pageInserts.slice(i, i + batchSize);
      const { error: pagesError } = await supabase
        .from('document_pages')
        .insert(batch);
      
      if (pagesError) {
        console.error('Error inserting document pages:', pagesError);
        // Continue anyway, as we've already saved the document
      }
    }
    
    // Generate a summary in the background
    generateDocumentSummary(documentData.id, pdfData.text).catch(error => {
      console.error('Error generating document summary:', error);
    });
    
    // Revalidate the documents path
    revalidatePath('/documents');
    
    return { 
      success: true, 
      documentId: documentData.id 
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    return { 
      success: false, 
      error: 'Error processing PDF' 
    };
  }
}

/**
 * Generate a summary for a document
 */
async function generateDocumentSummary(documentId: string, documentText: string): Promise<void> {
  try {
    // Create Supabase client
    const supabase = createClient(cookies());
    
    // Prepare document text
    const preparedText = prepareDocumentText(documentText);
    
    // Generate summary using Gemini API
    const summary = await generateSummary(truncateText(preparedText, 100000));
    
    // Update document with summary
    const { error } = await supabase
      .from('documents')
      .update({ summary })
      .eq('id', documentId);
    
    if (error) {
      console.error('Error updating document with summary:', error);
    }
  } catch (error) {
    console.error('Error generating document summary:', error);
    throw error;
  }
}

/**
 * Get a list of documents
 */
export async function getDocuments(): Promise<DocumentMetadata[]> {
  try {
    const supabase = createClient(cookies());
    
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, author, page_count, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      author: doc.author,
      pageCount: doc.page_count,
      createdAt: new Date(doc.created_at),
      updatedAt: new Date(doc.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

/**
 * Get a document by ID
 */
export async function getDocumentById(documentId: string): Promise<{
  document: any;
  pages: any[];
} | null> {
  try {
    const supabase = createClient(cookies());
    
    // Get document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (documentError) {
      console.error('Error fetching document:', documentError);
      return null;
    }
    
    // Get document pages
    const { data: pages, error: pagesError } = await supabase
      .from('document_pages')
      .select('*')
      .eq('document_id', documentId)
      .order('page_number', { ascending: true });
    
    if (pagesError) {
      console.error('Error fetching document pages:', pagesError);
      return { document, pages: [] };
    }
    
    return { document, pages };
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

/**
 * Ask a question about a document
 */
export async function askDocumentQuestion(
  documentId: string, 
  question: string
): Promise<{ 
  answer: string; 
  error?: string;
}> {
  try {
    const supabase = createClient(cookies());
    
    // Get document content
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('content_text')
      .eq('id', documentId)
      .single();
    
    if (documentError) {
      console.error('Error fetching document content:', documentError);
      return { answer: '', error: 'Error fetching document content' };
    }
    
    // Extract relevant context for the question
    const relevantContext = extractRelevantContext(
      document.content_text,
      question
    );
    
    // Generate response using Gemini API
    const answer = await generateResponse(question, relevantContext);
    
    // Save the Q&A interaction
    const { error: qaError } = await supabase
      .from('qa_sessions')
      .insert({
        document_id: documentId,
        question,
        answer,
        context: truncateText(relevantContext, 10000),
      });
    
    if (qaError) {
      console.error('Error saving Q&A session:', qaError);
      // Continue anyway, as we've already generated the answer
    }
    
    return { answer };
  } catch (error) {
    console.error('Error processing question:', error);
    return { 
      answer: '', 
      error: 'Error processing question' 
    };
  }
}

/**
 * Get Q&A history for a document
 */
export async function getDocumentQAHistory(documentId: string): Promise<{
  question: string;
  answer: string;
  createdAt: Date;
}[]> {
  try {
    const supabase = createClient(cookies());
    
    const { data, error } = await supabase
      .from('qa_sessions')
      .select('question, answer, created_at')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching Q&A history:', error);
      return [];
    }
    
    return data.map(qa => ({
      question: qa.question,
      answer: qa.answer,
      createdAt: new Date(qa.created_at),
    }));
  } catch (error) {
    console.error('Error fetching Q&A history:', error);
    return [];
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const supabase = createClient(cookies());
    
    // Get document file path
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();
    
    if (documentError) {
      console.error('Error fetching document for deletion:', documentError);
      return { success: false, error: 'Error fetching document' };
    }
    
    // Extract storage path from public URL
    const storagePathMatch = document.file_path.match(/\/documents\/([^?]+)/);
    if (storagePathMatch && storagePathMatch[1]) {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([storagePathMatch[1]]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue anyway, as we still want to delete the database records
      }
    }
    
    // Delete document (cascade should handle related records)
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return { success: false, error: 'Error deleting document' };
    }
    
    // Revalidate the documents path
    revalidatePath('/documents');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { 
      success: false, 
      error: 'Error deleting document' 
    };
  }
} 