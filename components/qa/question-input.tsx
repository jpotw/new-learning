'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface QuestionInputProps {
  onSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * Component for inputting questions about a document
 */
export function QuestionInput({
  onSubmit,
  isLoading,
  placeholder = 'Ask a question about this document...',
}: QuestionInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || isLoading) return;
    
    await onSubmit(question);
    setQuestion('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter (but not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
      <div className="flex-1">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !question.trim()} 
        className="h-10 px-4"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send question</span>
      </Button>
    </form>
  );
} 