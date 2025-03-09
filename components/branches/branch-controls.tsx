'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Send } from 'lucide-react';
import { askDocumentQuestion } from '@/app/actions/pdf-actions';

interface BranchControlsProps {
  documentId: string;
  currentBranchId: string | null;
  createBranch: (parentId: string | null, question: string, answer: string) => void;
}

/**
 * Component for branch controls (creating new branches)
 */
export function BranchControls({
  documentId,
  currentBranchId,
  createBranch,
}: BranchControlsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle creating a new branch
   */
  const handleCreateBranch = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Get answer from API
      const { answer, error } = await askDocumentQuestion(documentId, question);
      
      if (error) {
        console.error('Error getting answer:', error);
        return;
      }
      
      // Create new branch
      createBranch(currentBranchId, question, answer);
      
      // Reset form
      setQuestion('');
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating branch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {isCreating ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleCreateBranch}
              disabled={!question.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsCreating(false);
              setQuestion('');
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Branch
        </Button>
      )}
    </div>
  );
} 