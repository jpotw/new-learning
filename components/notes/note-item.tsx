'use client';

import { formatDistanceToNow } from 'date-fns';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/hooks/use-notes';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * Component for displaying an individual note item
 */
export function NoteItem({
  note,
  isSelected,
  onSelect,
  onDelete,
}: NoteItemProps) {
  return (
    <div
      className={`group relative rounded-md border p-3 transition-colors hover:bg-accent/50 ${
        isSelected ? 'border-primary bg-accent' : 'border-border'
      }`}
      onClick={onSelect}
    >
      {/* Note content */}
      <div className="space-y-1">
        <p className="line-clamp-2 text-sm">{note.content}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {note.pageNumber}
          </span>
          <span>
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">Delete note</span>
      </Button>
    </div>
  );
} 