"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  TextPosition, 
  HighlightPosition, 
  getSelectionPosition, 
  generateHighlightId 
} from "@/lib/utils/pdf-helpers";

export interface TextSelectionState {
  selection: TextPosition | null;
  highlights: HighlightPosition[];
  isSelecting: boolean;
}

export function useTextSelection(initialHighlights: HighlightPosition[] = []) {
  const [selectionState, setSelectionState] = useState<TextSelectionState>({
    selection: null,
    highlights: initialHighlights,
    isSelecting: false,
  });

  // Handle text selection
  const handleTextSelection = useCallback((pageNumber: number) => {
    if (typeof window === "undefined") return;
    
    const selection = getSelectionPosition(window, pageNumber);
    
    if (selection) {
      setSelectionState((prev) => ({
        ...prev,
        selection,
        isSelecting: true,
      }));
    } else {
      setSelectionState((prev) => ({
        ...prev,
        selection: null,
        isSelecting: false,
      }));
    }
  }, []);

  // Add a highlight from the current selection
  const addHighlight = useCallback((color: string = "#ffeb3b", note?: string) => {
    setSelectionState((prev) => {
      if (!prev.selection) return prev;

      const newHighlight: HighlightPosition = {
        ...prev.selection,
        id: generateHighlightId(),
        color,
        note,
        createdAt: new Date(),
      };

      return {
        ...prev,
        highlights: [...prev.highlights, newHighlight],
        selection: null,
        isSelecting: false,
      };
    });
  }, []);

  // Remove a highlight by ID
  const removeHighlight = useCallback((highlightId: string) => {
    setSelectionState((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h.id !== highlightId),
    }));
  }, []);

  // Update a highlight (e.g., change color or add/edit note)
  const updateHighlight = useCallback((
    highlightId: string, 
    updates: Partial<Pick<HighlightPosition, "color" | "note">>
  ) => {
    setSelectionState((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h) => 
        h.id === highlightId ? { ...h, ...updates } : h
      ),
    }));
  }, []);

  // Clear the current selection
  const clearSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    
    window.getSelection()?.removeAllRanges();
    
    setSelectionState((prev) => ({
      ...prev,
      selection: null,
      isSelecting: false,
    }));
  }, []);

  // Get highlights for a specific page
  const getHighlightsForPage = useCallback((pageNumber: number) => {
    return selectionState.highlights.filter(
      (highlight) => highlight.pageNumber === pageNumber
    );
  }, [selectionState.highlights]);

  // Clear all highlights
  const clearAllHighlights = useCallback(() => {
    setSelectionState((prev) => ({
      ...prev,
      highlights: [],
    }));
  }, []);

  // Reset selection when clicking outside
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClickOutside = (e: MouseEvent) => {
      // Only clear if we're not clicking on a highlight or selection-related element
      const target = e.target as HTMLElement;
      if (
        !target.closest(".pdf-highlight") && 
        !target.closest(".pdf-text-layer") &&
        !target.closest(".pdf-selection-tools")
      ) {
        clearSelection();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clearSelection]);

  return {
    ...selectionState,
    handleTextSelection,
    addHighlight,
    removeHighlight,
    updateHighlight,
    clearSelection,
    getHighlightsForPage,
    clearAllHighlights,
  };
} 