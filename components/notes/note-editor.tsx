'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/lib/hooks/use-notes';

interface NoteEditorProps {
  note: Note | null;
  onSave: (content: string) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Component for editing notes
 */
export function NoteEditor({
  note,
  onSave,
  onCancel,
  className,
}: NoteEditorProps) {
  const [content, setContent] = useState('');

  // Update content when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent('');
    }
  }, [note]);

  // Handle save
  const handleSave = () => {
    onSave(content);
    setContent('');
  };

  // Handle cancel
  const handleCancel = () => {
    setContent('');
    onCancel();
  };

  if (!note) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Edit Note
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Selected text */}
          <div className="rounded-md bg-muted p-2 text-sm">
            <p className="font-medium text-muted-foreground">Selected Text:</p>
            <p className="mt-1">{note.selectedText}</p>
          </div>

          {/* Note content */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!content.trim()}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
} 