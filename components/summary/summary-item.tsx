import { type Summary } from '@/lib/hooks/use-summaries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface SummaryItemProps {
  summary: Summary;
  onEdit?: (summary: Summary) => void;
}

export function SummaryItem({ summary, onEdit }: SummaryItemProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{summary.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Created: {new Date(summary.createdAt).toLocaleDateString()}
            {summary.updatedAt !== summary.createdAt && (
              <> • Updated: {new Date(summary.updatedAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(summary)}
            className="ml-4"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {summary.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </Card>
  );
} 