import { useState, useCallback } from 'react';
import { askDocumentQuestion, getDocumentQAHistory } from '@/app/actions/pdf-actions';

interface QAMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt?: Date;
}

interface UseQAResult {
  messages: QAMessage[];
  isLoading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<void>;
  loadQAHistory: () => Promise<void>;
}

/**
 * Hook for managing Q&A interactions with a document
 */
export function useQA(documentId: string): UseQAResult {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ask a question about the document
   */
  const askQuestion = useCallback(
    async (question: string) => {
      if (!question.trim()) return;
      
      setIsLoading(true);
      setError(null);
      
      // Add user question to messages
      const userMessage: QAMessage = {
        content: question,
        role: 'user',
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      try {
        // Send question to API
        const { answer, error } = await askDocumentQuestion(documentId, question);
        
        if (error) {
          setError(error);
          return;
        }
        
        // Add AI response to messages
        const assistantMessage: QAMessage = {
          content: answer,
          role: 'assistant',
          createdAt: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError('Failed to get answer. Please try again.');
        console.error('Error asking question:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [documentId]
  );

  /**
   * Load Q&A history for the document
   */
  const loadQAHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await getDocumentQAHistory(documentId);
      
      // Convert history to messages format
      const historyMessages: QAMessage[] = [];
      
      history.forEach((item) => {
        // Add user question
        historyMessages.push({
          content: item.question,
          role: 'user',
          createdAt: item.createdAt,
        });
        
        // Add AI answer
        historyMessages.push({
          content: item.answer,
          role: 'assistant',
          createdAt: item.createdAt,
        });
      });
      
      setMessages(historyMessages);
    } catch (err) {
      setError('Failed to load Q&A history.');
      console.error('Error loading Q&A history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  return {
    messages,
    isLoading,
    error,
    askQuestion,
    loadQAHistory,
  };
} 