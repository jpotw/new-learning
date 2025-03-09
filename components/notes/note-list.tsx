'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Note } from '@/lib/hooks/use-notes';
import { NoteItem } from './note-item';

interface NoteListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelect: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  className?: string;
}

/**
 * Component for displaying a list of notes
 */
export function NoteList({
  notes,
  selectedNote,
  onSelect,
  onDelete,
  className,
}: NoteListProps) {
  return (
    <ScrollArea className={className}>
      <div className="space-y-2 p-1">
        {notes.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No notes yet. Select text to add notes.
          </div>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedNote?.id === note.id}
              onSelect={() => onSelect(note.id)}
              onDelete={() => onDelete(note.id)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
} 