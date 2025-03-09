"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { usePdf } from "@/lib/hooks/use-pdf";
import { useTextSelection } from "@/lib/hooks/use-text-selection";
import { PdfControls } from "./pdf-controls";
import { PdfTextLayer } from "./pdf-text-layer";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HighlightPosition } from "@/lib/utils/pdf-helpers";

interface PdfViewerProps {
  file: string | File;
  onDocumentLoad?: () => void;
  initialHighlights?: HighlightPosition[];
  onHighlightsChange?: (highlights: HighlightPosition[]) => void;
}

export function PdfViewer({
  file,
  onDocumentLoad,
  initialHighlights = [],
  onHighlightsChange,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  
  const {
    numPages,
    currentPage,
    scale,
    rotation,
    isLoading,
    error,
    loadPdf,
    handleDocumentLoadSuccess,
    handleDocumentLoadError,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    zoomIn,
    zoomOut,
    rotateClockwise,
    rotateCounterClockwise,
  } = usePdf();

  const {
    selection,
    highlights,
    handleTextSelection,
    addHighlight,
    removeHighlight,
    updateHighlight,
    clearSelection,
  } = useTextSelection(initialHighlights);

  // Load PDF when file changes
  useEffect(() => {
    if (file) {
      loadPdf(file);
    }
  }, [file, loadPdf]);

  // Update container width on resize
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // Initial width
    updateContainerWidth();

    // Add resize listener
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // Notify parent component when highlights change
  useEffect(() => {
    if (onHighlightsChange) {
      onHighlightsChange(highlights);
    }
  }, [highlights, onHighlightsChange]);

  // Handle document load success
  const onLoadSuccess = (data: { numPages: number }) => {
    handleDocumentLoadSuccess(data);
    if (onDocumentLoad) {
      onDocumentLoad();
    }
    toast.success(`PDF loaded successfully with ${data.numPages} pages`);
  };

  // Handle document load error
  const onLoadError = (error: Error) => {
    handleDocumentLoadError(error);
    toast.error("Failed to load PDF document");
  };

  // Handle page render success to get page dimensions
  const handlePageRenderSuccess = (page: any) => {
    const { height } = page;
    setPageHeight(height * scale);
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div 
          ref={containerRef} 
          className="flex-1 overflow-auto relative flex justify-center"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <p className="text-destructive">Error loading PDF: {error.message}</p>
            </div>
          )}

          <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={null}
            className="my-4 relative"
          >
            {numPages > 0 && (
              <div className="relative">
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  width={containerWidth ? containerWidth * 0.9 : undefined}
                  loading={null}
                  className="shadow-md"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onRenderSuccess={handlePageRenderSuccess}
                />
                
                {containerWidth && pageHeight && (
                  <PdfTextLayer
                    pageNumber={currentPage}
                    scale={scale}
                    rotation={rotation}
                    width={containerWidth * 0.9}
                    height={pageHeight}
                    onTextSelection={handleTextSelection}
                    currentSelection={selection}
                    highlights={highlights}
                    onAddHighlight={addHighlight}
                    onUpdateHighlight={updateHighlight}
                    onDeleteHighlight={removeHighlight}
                    onClearSelection={clearSelection}
                  />
                )}
              </div>
            )}
          </Document>
        </div>

        <PdfControls
          pdfState={{ numPages, currentPage, scale, rotation }}
          onNextPage={goToNextPage}
          onPrevPage={goToPreviousPage}
          onGoToPage={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onRotateClockwise={rotateClockwise}
          onRotateCounterClockwise={rotateCounterClockwise}
        />
      </CardContent>
    </Card>
  );
} 