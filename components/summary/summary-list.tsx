import { useSummaries, type Summary } from '@/lib/hooks/use-summaries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SummaryListProps {
  documentId?: string;
  onEdit?: (summary: Summary) => void;
}

export function SummaryList({ documentId, onEdit }: SummaryListProps) {
  const { summaries, loading, error, deleteSummary } = useSummaries(documentId);

  const handleDelete = async (id: string) => {
    try {
      await deleteSummary(id);
      toast.success('Summary deleted successfully');
    } catch (error) {
      toast.error('Failed to delete summary');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading summaries...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No summaries found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary) => (
        <Card key={summary.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{summary.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(summary.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 line-clamp-2">{summary.content}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(summary)}
                  title="Edit summary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(summary.id)}
                title="Delete summary"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Link href={`/summaries/${summary.id}`}>
                <Button variant="ghost" size="icon" title="View summary">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 