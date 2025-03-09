'use client';

import { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QAMessage {
  content: string;
  role: 'user' | 'assistant';
  createdAt?: Date;
}

interface AnswerDisplayProps {
  messages: QAMessage[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * Component for displaying Q&A messages
 */
export function AnswerDisplay({
  messages,
  isLoading = false,
  error = null,
  className,
}: AnswerDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center text-muted-foreground", className)}>
        <Bot className="mb-2 h-8 w-8" />
        <p>Ask a question about this document to get started.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-4 overflow-y-auto p-4", className)}>
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 rounded-lg p-3",
            message.role === 'user'
              ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
              : "mr-auto max-w-[80%] bg-muted"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
            {message.role === 'user' ? (
              <User className="h-5 w-5" />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="prose prose-sm dark:prose-invert">
              {message.content.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
            {message.createdAt && (
              <div className="mt-1 text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="mr-auto flex max-w-[80%] items-start gap-3 rounded-lg bg-muted p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mr-auto max-w-[80%] rounded-lg bg-destructive/10 p-3 text-destructive">
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
} 