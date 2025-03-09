'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { generateSummary, updateSummary } from '@/app/actions/summary-actions';
import { toast } from 'sonner';

interface SummaryGeneratorProps {
  sessionId: string;
  initialSummary?: string;
}

export function SummaryGenerator({ sessionId, initialSummary }: SummaryGeneratorProps) {
  const [summary, setSummary] = useState(initialSummary || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      const result = await generateSummary(sessionId);
      
      if (result.success && result.summary) {
        setSummary(result.summary);
        toast.success('Summary generated successfully');
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      toast.error('An error occurred while generating the summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSummary = async () => {
    await handleGenerateSummary();
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Q&A Summary</h3>
        <div className="space-x-2">
          {!summary && (
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Summary
            </Button>
          )}
          {summary && (
            <Button
              variant="outline"
              onClick={handleRegenerateSummary}
              disabled={isGenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {summary && (
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </Card>
  );
} 