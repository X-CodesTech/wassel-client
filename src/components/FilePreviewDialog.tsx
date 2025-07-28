import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileImage,
  File,
  Download,
  X,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { apiUrlConstants } from "@/services/apiUrlConstants";

interface FilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  contextType: "Customer" | "Vendor" | "Order";
  contextId: string;
  fileType?: string;
  fileSize?: number;
}

const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  isOpen,
  onClose,
  fileName,
  contextType,
  contextId,
  fileType,
  fileSize,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");

  // Get file URL based on context
  const getFileUrl = () => {
    switch (contextType) {
      case "Customer":
        return `${apiUrlConstants.uploads}/customers/${contextId}/files/${fileName}`;
      case "Vendor":
        return `${apiUrlConstants.uploads}/vendors/${contextId}/files/${fileName}`;
      case "Order":
        return `${apiUrlConstants.uploads}/orders/${contextId}/files/${fileName}`;
      default:
        return "";
    }
  };

  // Get file type category
  const getFileTypeCategory = (type?: string) => {
    if (!type) return "unknown";

    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf") return "pdf";
    if (type.startsWith("text/")) return "text";
    if (
      type.includes("spreadsheet") ||
      type.includes("excel") ||
      type.includes("csv")
    )
      return "spreadsheet";
    if (type.includes("word") || type.includes("document")) return "document";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "presentation";

    return "unknown";
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type?: string) => {
    const category = getFileTypeCategory(type);
    switch (category) {
      case "image":
        return <FileImage className="w-8 h-8 text-blue-500" />;
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "text":
        return <FileText className="w-8 h-8 text-green-500" />;
      case "spreadsheet":
        return <FileText className="w-8 h-8 text-green-600" />;
      case "document":
        return <FileText className="w-8 h-8 text-blue-600" />;
      case "presentation":
        return <FileText className="w-8 h-8 text-orange-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  // Load preview content
  useEffect(() => {
    if (!isOpen || !fileName) return;

    setIsLoading(true);
    setError("");
    setPreviewContent("");
    setPreviewUrl("");

    const fileUrl = getFileUrl();
    const category = getFileTypeCategory(fileType);

    const loadPreview = async () => {
      try {
        if (category === "image") {
          // For images, we can directly use the URL
          setPreviewUrl(fileUrl);
        } else if (category === "pdf") {
          // For PDFs, we can embed them
          setPreviewUrl(fileUrl);
        } else if (category === "text") {
          // For text files, fetch and display content
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error("Failed to load text content");
          const text = await response.text();
          setPreviewContent(text);
        } else {
          // For other file types, show a placeholder
          setPreviewContent(
            `Preview not available for ${
              fileType || "this file type"
            }.\n\nFile: ${fileName}\nSize: ${formatFileSize(fileSize)}\nType: ${
              fileType || "Unknown"
            }`
          );
        }
      } catch (err) {
        setError(
          "Failed to load file preview. The file may not be accessible or the preview is not supported."
        );
        console.error("Preview error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [isOpen, fileName, contextType, contextId, fileType]);

  // Handle download
  const handleDownload = () => {
    const fileUrl = getFileUrl();
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const category = getFileTypeCategory(fileType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {getFileIcon(fileType)}
            <div>
              <DialogTitle className="text-lg font-semibold">
                {fileName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {fileType || "Unknown type"}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatFileSize(fileSize)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading preview...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium mb-2">Preview Error</p>
                <p className="text-sm text-gray-600 max-w-md">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="mt-3"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download Instead
                </Button>
              </div>
            </div>
          ) : category === "image" ? (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onError={() => setError("Failed to load image preview")}
              />
            </div>
          ) : category === "pdf" ? (
            <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title={fileName}
                onError={() => setError("Failed to load PDF preview")}
              />
            </div>
          ) : category === "text" ? (
            <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
                {previewContent}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-2">
                  Preview Not Available
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  This file type doesn't support preview.
                </p>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
