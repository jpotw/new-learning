"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { PdfState } from "@/lib/hooks/use-pdf";

interface PdfControlsProps {
  pdfState: Omit<PdfState, "file" | "error" | "isLoading">;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
}

export function PdfControls({
  pdfState,
  onNextPage,
  onPrevPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onRotateClockwise,
  onRotateCounterClockwise,
}: PdfControlsProps) {
  const { currentPage, numPages, scale, rotation } = pdfState;
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString());

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  // Handle page input submission
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInputValue, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numPages) {
      onGoToPage(pageNumber);
    } else {
      // Reset to current page if invalid
      setPageInputValue(currentPage.toString());
    }
  };

  // Update page input when current page changes
  if (currentPage.toString() !== pageInputValue && !document.activeElement?.id?.includes("page-input")) {
    setPageInputValue(currentPage.toString());
  }

  return (
    <div className="flex items-center justify-between p-2 border-t bg-background">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
        
        <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-1">
          <Input
            id="page-input"
            type="text"
            value={pageInputValue}
            onChange={handlePageInputChange}
            className="w-12 h-8 text-center"
            onBlur={handlePageInputSubmit}
          />
          <span className="text-sm text-muted-foreground">/ {numPages}</span>
        </form>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={currentPage >= numPages}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom Out</span>
        </Button>
        
        <span className="text-sm text-muted-foreground w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          disabled={scale >= 3.0}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom In</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onRotateCounterClockwise}
          title="Rotate Counterclockwise"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Rotate Counterclockwise</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onRotateClockwise}
          title="Rotate Clockwise"
        >
          <RotateCw className="h-4 w-4" />
          <span className="sr-only">Rotate Clockwise</span>
        </Button>
      </div>
    </div>
  );
} 