import { PDFPageProxy } from "react-pdf";

export interface TextPosition {
  pageNumber: number;
  boundingRect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
  text: string;
}

export interface HighlightPosition extends TextPosition {
  id: string;
  color?: string;
  note?: string;
  createdAt: Date;
}

/**
 * Generates a unique ID for a highlight
 */
export function generateHighlightId(): string {
  return `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalizes a selection rectangle to ensure consistent coordinates
 */
export function normalizeRect(rect: {
  left: number;
  top: number;
  right: number;
  bottom: number;
}): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
} {
  const { left, top, right, bottom } = rect;

  return {
    x1: left,
    y1: top,
    x2: right,
    y2: bottom,
    width: right - left,
    height: bottom - top,
  };
}

/**
 * Converts client coordinates to PDF page coordinates
 */
export function convertClientCoordsToPageCoords(
  clientX: number,
  clientY: number,
  page: PDFPageProxy,
  pageElement: HTMLElement,
  scale: number
): { x: number; y: number } {
  const pageRect = pageElement.getBoundingClientRect();
  
  // Calculate coordinates relative to the page element
  const relativeX = clientX - pageRect.left;
  const relativeY = clientY - pageRect.top;
  
  // Convert to PDF coordinates by dividing by scale
  const pdfX = relativeX / scale;
  const pdfY = relativeY / scale;
  
  return { x: pdfX, y: pdfY };
}

/**
 * Checks if two highlight positions overlap
 */
export function doHighlightsOverlap(
  highlight1: HighlightPosition,
  highlight2: HighlightPosition
): boolean {
  if (highlight1.pageNumber !== highlight2.pageNumber) {
    return false;
  }

  const rect1 = highlight1.boundingRect;
  const rect2 = highlight2.boundingRect;

  return !(
    rect1.x2 < rect2.x1 ||
    rect1.x1 > rect2.x2 ||
    rect1.y2 < rect2.y1 ||
    rect1.y1 > rect2.y2
  );
}

/**
 * Merges overlapping highlights
 */
export function mergeHighlights(
  highlight1: HighlightPosition,
  highlight2: HighlightPosition
): HighlightPosition {
  const rect1 = highlight1.boundingRect;
  const rect2 = highlight2.boundingRect;

  const mergedRect = {
    x1: Math.min(rect1.x1, rect2.x1),
    y1: Math.min(rect1.y1, rect2.y1),
    x2: Math.max(rect1.x2, rect2.x2),
    y2: Math.max(rect1.y2, rect2.y2),
    width: 0,
    height: 0,
  };

  mergedRect.width = mergedRect.x2 - mergedRect.x1;
  mergedRect.height = mergedRect.y2 - mergedRect.y1;

  return {
    id: highlight1.id,
    pageNumber: highlight1.pageNumber,
    boundingRect: mergedRect,
    text: `${highlight1.text} ${highlight2.text}`.trim(),
    color: highlight1.color,
    note: highlight1.note || highlight2.note,
    createdAt: highlight1.createdAt < highlight2.createdAt ? highlight1.createdAt : highlight2.createdAt,
  };
}

/**
 * Gets the bounding client rect for a text selection
 */
export function getSelectionPosition(
  window: Window,
  pageNumber: number
): TextPosition | null {
  const selection = window.getSelection();
  
  if (!selection || selection.isCollapsed) {
    return null;
  }
  
  const range = selection.getRangeAt(0);
  const clientRects = range.getClientRects();
  
  if (clientRects.length === 0) {
    return null;
  }
  
  // Get the bounding client rect of the entire selection
  const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
  
  const boundingRect = normalizeRect({
    left: selectionRect.left,
    top: selectionRect.top,
    right: selectionRect.right,
    bottom: selectionRect.bottom,
  });
  
  return {
    pageNumber,
    boundingRect,
    text: selection.toString(),
  };
}