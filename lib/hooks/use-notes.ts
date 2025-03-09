import { useState, useCallback } from 'react';
import { useTextSelection } from './use-text-selection';

export interface Note {
  id: string;
  documentId: string;
  pageNumber: number;
  selectedText: string;
  content: string;
  color: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UseNotesResult {
  notes: Note[];
  selectedNote: Note | null;
  isLoading: boolean;
  error: string | null;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  getPageNotes: (pageNumber: number) => Note[];
}

/**
 * Hook for managing notes and highlights
 */
export function useNotes(documentId: string): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use text selection hook for getting selected text position
  const { selection, isSelecting } = useTextSelection();

  /**
   * Create a new note
   */
  const createNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    setSelectedNote(newNote);
  }, []);

  /**
   * Update an existing note
   */
  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            content,
            updatedAt: new Date(),
          };
        }
        return note;
      });
    });
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback((id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  }, [selectedNote]);

  /**
   * Select a note
   */
  const selectNote = useCallback((id: string | null) => {
    if (!id) {
      setSelectedNote(null);
      return;
    }

    const note = notes.find((n) => n.id === id);
    setSelectedNote(note || null);
  }, [notes]);

  /**
   * Get notes for a specific page
   */
  const getPageNotes = useCallback((pageNumber: number) => {
    return notes.filter((note) => note.pageNumber === pageNumber);
  }, [notes]);

  return {
    notes,
    selectedNote,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    getPageNotes,
  };
} 