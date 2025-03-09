'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionInput } from './question-input';
import { AnswerDisplay } from './answer-display';
import { useQA } from '@/lib/hooks/use-qa';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface QAContainerProps {
  documentId: string;
  title?: string;
  className?: string;
}

/**
 * Container component for the Q&A interface
 */
export function QAContainer({
  documentId,
  title = 'Ask Questions',
  className,
}: QAContainerProps) {
  const { messages, isLoading, error, askQuestion, loadQAHistory } = useQA(documentId);

  // Load Q&A history when component mounts
  useEffect(() => {
    loadQAHistory();
  }, [loadQAHistory]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => loadQAHistory()}
          disabled={isLoading}
          title="Refresh Q&A history"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex h-[400px] flex-col">
          <div className="flex-1 overflow-hidden">
            <AnswerDisplay
              messages={messages}
              isLoading={isLoading}
              error={error}
              className="h-full"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-card p-4">
        <QuestionInput
          onSubmit={askQuestion}
          isLoading={isLoading}
        />
      </CardFooter>
    </Card>
  );
} 