"use client";

import { useRef, useState } from "react";
import { HighlightPosition } from "@/lib/utils/pdf-helpers";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PdfHighlightProps {
  highlight: HighlightPosition;
  scale: number;
  onUpdate: (id: string, updates: { note?: string; color?: string }) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function PdfHighlight({
  highlight,
  scale,
  onUpdate,
  onDelete,
  isSelected = false,
  onSelect,
}: PdfHighlightProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(highlight.note || "");
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  // Scale the highlight position based on the current zoom level
  const scaledPosition = {
    left: highlight.boundingRect.x1 * scale,
    top: highlight.boundingRect.y1 * scale,
    width: highlight.boundingRect.width * scale,
    height: highlight.boundingRect.height * scale,
  };

  // Handle click on highlight
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(highlight.id);
    }
  };

  // Start editing the note
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    // Focus the textarea after rendering
    setTimeout(() => {
      if (noteInputRef.current) {
        noteInputRef.current.focus();
      }
    }, 0);
  };

  // Save the note
  const handleSaveNote = () => {
    onUpdate(highlight.id, { note: noteText });
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setNoteText(highlight.note || "");
    setIsEditing(false);
  };

  // Delete the highlight
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(highlight.id);
  };

  // Change highlight color
  const handleColorChange = (color: string) => {
    onUpdate(highlight.id, { color });
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
    <>
      {/* The highlight itself */}
      <div
        className={cn(
          "absolute pdf-highlight cursor-pointer transition-all",
          isSelected ? "ring-2 ring-primary ring-offset-2" : ""
        )}
        style={{
          left: `${scaledPosition.left}px`,
          top: `${scaledPosition.top}px`,
          width: `${scaledPosition.width}px`,
          height: `${scaledPosition.height}px`,
          backgroundColor: `${highlight.color || "#ffeb3b"}80`, // Add transparency
          pointerEvents: "all",
        }}
        onClick={handleClick}
        title={highlight.text}
      />

      {/* Controls that appear when a highlight is selected */}
      {isSelected && !isEditing && (
        <div
          className="absolute z-10 bg-background border rounded-md shadow-md p-2 pdf-selection-tools"
          style={{
            left: `${scaledPosition.left}px`,
            top: `${scaledPosition.top + scaledPosition.height + 5}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 text-sm font-medium truncate max-w-[200px]">
              {highlight.text}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDelete}
              title="Delete highlight"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {highlight.note && (
            <div className="text-sm text-muted-foreground mb-2 max-w-[250px] max-h-[100px] overflow-auto">
              {highlight.note}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-5 h-5 rounded-full border border-gray-300",
                    highlight.color === color ? "ring-2 ring-primary" : ""
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={`Change to ${color} highlight`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={handleEditClick}
            >
              <Pencil className="h-3 w-3 mr-1" />
              {highlight.note ? "Edit" : "Add"} Note
            </Button>
          </div>
        </div>
      )}

      {/* Note editor */}
      {isSelected && isEditing && (
        <div
          className="absolute z-10 bg-background border rounded-md shadow-md p-2 pdf-selection-tools"
          style={{
            left: `${scaledPosition.left}px`,
            top: `${scaledPosition.top + scaledPosition.height + 5}px`,
            width: "300px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Add Note</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            ref={noteInputRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note to this highlight..."
            className="min-h-[100px] mb-2"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNote}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </>
  );
} 