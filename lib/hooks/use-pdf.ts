"use client";

import { useState, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export interface PdfState {
  numPages: number;
  currentPage: number;
  scale: number;
  rotation: number;
  file: string | File | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePdf(initialFile?: string | File) {
  const [pdfState, setPdfState] = useState<PdfState>({
    numPages: 0,
    currentPage: 1,
    scale: 1.0,
    rotation: 0,
    file: initialFile || null,
    isLoading: false,
    error: null,
  });

  // Load PDF file
  const loadPdf = (file: string | File) => {
    setPdfState((prev) => ({
      ...prev,
      file,
      isLoading: true,
      error: null,
    }));
  };

  // Handle document load success
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPdfState((prev) => ({
      ...prev,
      numPages,
      currentPage: 1,
      isLoading: false,
    }));
  };

  // Handle document load error
  const handleDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setPdfState((prev) => ({
      ...prev,
      error,
      isLoading: false,
    }));
  };

  // Navigation functions
  const goToNextPage = () => {
    setPdfState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.numPages),
    }));
  };

  const goToPreviousPage = () => {
    setPdfState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pdfState.numPages) {
      setPdfState((prev) => ({
        ...prev,
        currentPage: pageNumber,
      }));
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setPdfState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.1, 3.0),
    }));
  };

  const zoomOut = () => {
    setPdfState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.1, 0.5),
    }));
  };

  const setZoom = (scale: number) => {
    if (scale >= 0.5 && scale <= 3.0) {
      setPdfState((prev) => ({
        ...prev,
        scale,
      }));
    }
  };

  // Rotation functions
  const rotateClockwise = () => {
    setPdfState((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const rotateCounterClockwise = () => {
    setPdfState((prev) => ({
      ...prev,
      rotation: (prev.rotation - 90 + 360) % 360,
    }));
  };

  // Load initial file if provided
  useEffect(() => {
    if (initialFile) {
      loadPdf(initialFile);
    }
  }, [initialFile]);

  return {
    ...pdfState,
    loadPdf,
    handleDocumentLoadSuccess,
    handleDocumentLoadError,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    zoomIn,
    zoomOut,
    setZoom,
    rotateClockwise,
    rotateCounterClockwise,
  };
} 