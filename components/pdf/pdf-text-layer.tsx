"use client";

import { useEffect, useRef, useState } from "react";
import { PdfHighlight } from "./pdf-highlight";
import { HighlightPosition, TextPosition } from "@/lib/utils/pdf-helpers";
import { Button } from "@/components/ui/button";
import { Highlighter, X } from "lucide-react";

interface PdfTextLayerProps {
  pageNumber: number;
  scale: number;
  rotation: number;
  width: number;
  height: number;
  onTextSelection: (pageNumber: number) => void;
  currentSelection: TextPosition | null;
  highlights: HighlightPosition[];
  onAddHighlight: (color?: string, note?: string) => void;
  onUpdateHighlight: (id: string, updates: { note?: string; color?: string }) => void;
  onDeleteHighlight: (id: string) => void;
  onClearSelection: () => void;
}

export function PdfTextLayer({
  pageNumber,
  scale,
  rotation,
  width,
  height,
  onTextSelection,
  currentSelection,
  highlights,
  onAddHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  onClearSelection,
}: PdfTextLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);

  // Filter highlights for this page
  const pageHighlights = highlights.filter(
    (highlight) => highlight.pageNumber === pageNumber
  );

  // Handle mouse up event to capture text selection
  useEffect(() => {
    const handleMouseUp = () => {
      onTextSelection(pageNumber);
    };

    const layerElement = layerRef.current;
    if (layerElement) {
      layerElement.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (layerElement) {
        layerElement.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [onTextSelection, pageNumber]);

  // Handle click on the layer to clear selection and selected highlight
  const handleLayerClick = () => {
    setSelectedHighlightId(null);
    onClearSelection();
  };

  // Handle highlight selection
  const handleHighlightSelect = (id: string) => {
    setSelectedHighlightId(id === selectedHighlightId ? null : id);
    onClearSelection();
  };

  // Scale the selection position based on the current zoom level
  const getScaledPosition = (selection: TextPosition) => {
    return {
      left: selection.boundingRect.x1 * scale,
      top: selection.boundingRect.y1 * scale,
      width: selection.boundingRect.width * scale,
      height: selection.boundingRect.height * scale,
    };
  };

  // Available highlight colors
  const colors = [
    "#ffeb3b", // Yellow (default)
    "#4caf50", // Green
    "#2196f3", // Blue
    "#f44336", // Red
    "#9c27b0", // Purple
  ];

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 pdf-text-layer"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
      onClick={handleLayerClick}
    >
      {/* Render existing highlights */}
      {pageHighlights.map((highlight) => (
        <PdfHighlight
          key={highlight.id}
          highlight={highlight}
          scale={scale}
          onUpdate={onUpdateHighlight}
          onDelete={onDeleteHighlight}
          isSelected={selectedHighlightId === highlight.id}
          onSelect={handleHighlightSelect}
        />
      ))}

      {/* Render current selection */}
      {currentSelection && currentSelection.pageNumber === pageNumber && (
        <>
          {/* Selection highlight */}
          <div
            className="absolute bg-yellow-300/50 pointer-events-none"
            style={{
              ...getScaledPosition(currentSelection),
            }}
          />

          {/* Selection tools */}
          <div
            className="absolute z-10 bg-background border rounded-md shadow-md p-2 pdf-selection-tools"
            style={{
              left: `${getScaledPosition(currentSelection).left}px`,
              top: `${
                getScaledPosition(currentSelection).top +
                getScaledPosition(currentSelection).height +
                5
              }px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium">Highlight:</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onClearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary"
                  style={{ backgroundColor: color }}
                  onClick={() => onAddHighlight(color)}
                  title={`Highlight with ${color}`}
                >
                  <Highlighter className="h-3 w-3 text-black/70" />
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => onAddHighlight(undefined, "")}
              >
                Highlight & Note
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 