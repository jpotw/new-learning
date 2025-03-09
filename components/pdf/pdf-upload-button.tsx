"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { validatePdfFile, formatFileSize } from "@/lib/utils/file-validation";
import { toast } from "sonner";

interface PdfUploadButtonProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function PdfUploadButton({
  onFileSelect,
  isLoading = false,
  variant = "default",
}: PdfUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    onFileSelect(file);
    
    // Reset the input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className={`relative ${
        isDragging ? "bg-muted/50 border-primary" : ""
      } border-2 border-dashed rounded-lg p-4 transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={isLoading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        variant={variant}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? "Uploading..." : "Upload PDF"}
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Drag and drop a PDF file here, or click to browse
      </p>
      <p className="text-xs text-muted-foreground text-center">
        Maximum file size: {formatFileSize(10 * 1024 * 1024)}
      </p>
    </div>
  );
} 