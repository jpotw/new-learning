"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfUploadButton } from "./pdf-upload-button";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/file-validation";
import { FileText, X, Check } from "lucide-react";
import { toast } from "sonner";

interface PdfUploadProps {
  onUploadComplete: (file: File) => void;
  onCancel?: () => void;
  isUploading?: boolean;
}

export function PdfUpload({
  onUploadComplete,
  onCancel,
  isUploading = false,
}: PdfUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast.success("PDF file selected successfully");
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUploadComplete(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload PDF Document</CardTitle>
        <CardDescription>
          Upload a PDF document to analyze and interact with its content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <PdfUploadButton onFileSelect={handleFileSelect} isLoading={isUploading} />
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isUploading}
                className="ml-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {selectedFile && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
            {!isUploading && <Check className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 