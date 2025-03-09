import { useState } from 'react';
import { type Summary } from '@/lib/hooks/use-summaries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SummaryEditorProps {
  summary?: Summary;
  onSave: (data: Partial<Summary>) => Promise<void>;
  onCancel: () => void;
}

export function SummaryEditor({ summary, onSave, onCancel }: SummaryEditorProps) {
  const [title, setTitle] = useState(summary?.title || '');
  const [content, setContent] = useState(summary?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        content: content.trim(),
      });
      toast.success('Summary saved successfully');
    } catch (error) {
      toast.error('Failed to save summary');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter summary title"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter summary content"
            className="min-h-[200px]"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 