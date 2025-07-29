import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Square,
  UploadCloud,
  Upload,
  File,
  X,
  Eye,
  Download,
  Trash2,
  FileText,
  FileImage,
  Printer,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiUrlConstants } from "@/services/apiUrlConstants";
import { useAttachments } from "@/hooks/useAttachments";
import {
  AttachmentFile,
  SupportedFileType,
  SupportedMimeType,
} from "@/services/attachmentServices";
import { cn } from "@/utils";
import { TLoading } from "@/types";
import FilePreviewDialog from "./FilePreviewDialog";

interface AttachmentData {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: SupportedMimeType;
  fileType: SupportedFileType;
  uploadedBy: string;
  uploadedAt: Date;
  custAccount?: string;
  vendAccount?: string;
  orderId?: string;
  status: "active" | "inactive" | "deleted";
  category: "customer" | "vendor" | "order" | "price-list";
}

type ContextType = "Vendor" | "Customer" | "Order";

interface AttachmentModuleProps {
  contextType: ContextType;
  contextId: string; // custAccount, vendAccount, or orderId
  title?: string;
}

// Upload Dialog Component
const UploadDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  contextType: ContextType;
  uploadLoading: TLoading;
}> = ({ isOpen, onClose, onUpload, contextType, uploadLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsDragOver(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {contextType} Attachment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-500 mb-6">
              Supported formats: PDF, Excel, Word, Images (max 10MB)
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() =>
                  document.getElementById("dialog-file-upload")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <span className="text-sm text-gray-500">or drag and drop</span>
            </div>
            <input
              id="dialog-file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileInput}
            />
          </div>

          {selectedFile && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadLoading === "pending"}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploadLoading === "pending" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AttachmentModule: React.FC<AttachmentModuleProps> = ({
  contextType,
  contextId,
  title,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    fileName: "",
    originalName: "",
    fileType: "",
    uploadedBy: "",
    category: "",
    status: "",
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [tableDragOver, setTableDragOver] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const [previewDialog, setPreviewDialog] = useState<{
    isOpen: boolean;
    fileName: string;
    fileType?: string;
    fileSize?: number;
  }>({
    isOpen: false,
    fileName: "",
    fileType: undefined,
    fileSize: undefined,
  });

  const {
    customerFiles,
    vendorFiles,
    orderFiles,
    loading,
    error,
    uploadLoading,
    uploadError,
    uploadSuccess,
    deleteLoading,
    deleteError,
    deleteSuccess,
    getCustomerAttachments,
    getVendorAttachments,
    getOrderAttachments,
    uploadCustomerAttachment,
    uploadVendorAttachment,
    uploadOrderAttachment,
    deleteCustomerAttachment,
    deleteVendorAttachment,
    deleteOrderAttachment,
  } = useAttachments();

  const { toast } = useToast();

  // Get the appropriate data based on context
  const getContextData = useCallback((): AttachmentData[] => {
    const files =
      contextType === "Customer"
        ? customerFiles
        : contextType === "Vendor"
        ? vendorFiles
        : orderFiles;

    return files.map((file) => ({
      id: file.fileName,
      fileName: file.fileName,
      originalName: file.fileName,
      fileSize: file.fileSize,
      mimeType: getMimeTypeFromFileName(file.fileName) as SupportedMimeType,
      fileType: getFileTypeFromFileName(file.fileName),
      uploadedBy: "System",
      uploadedAt: new Date(file.uploadedAt),
      custAccount: contextType === "Customer" ? contextId : undefined,
      vendAccount: contextType === "Vendor" ? contextId : undefined,
      orderId: contextType === "Order" ? contextId : undefined,
      status: "active" as const,
      category: contextType.toLowerCase() as "customer" | "vendor" | "order",
    }));
  }, [contextType, contextId, customerFiles, vendorFiles, orderFiles]);

  // Get context information for display
  const getContextInfo = useCallback(() => {
    // This would be populated from the API response data
    // For now, we'll use the contextId and contextType
    switch (contextType) {
      case "Vendor":
        return {
          type: "Vendor",
          id: contextId,
          name: contextId, // This would come from response.data.vendor.vendName
          color: "bg-green-100 text-green-800",
        };
      case "Customer":
        return {
          type: "Customer",
          id: contextId,
          name: contextId, // This would come from response.data.customer?.custName
          color: "bg-blue-100 text-blue-800",
        };
      case "Order":
        return {
          type: "Order",
          id: contextId,
          name: contextId, // This would come from response.data.order?.orderNumber
          color: "bg-purple-100 text-purple-800",
        };
      default:
        return {
          type: contextType,
          id: contextId,
          name: contextId,
          color: "bg-gray-100 text-gray-800",
        };
    }
  }, [contextType, contextId]);

  const getFileTypeFromFileName = (fileName: string): SupportedFileType => {
    if (fileName.toLowerCase().endsWith(".pdf")) return "pdf";
    if (
      fileName.toLowerCase().endsWith(".xlsx") ||
      fileName.toLowerCase().endsWith(".xls")
    )
      return "excel";
    if (
      fileName.toLowerCase().endsWith(".docx") ||
      fileName.toLowerCase().endsWith(".doc")
    )
      return "word";
    if (
      fileName.toLowerCase().endsWith(".jpg") ||
      fileName.toLowerCase().endsWith(".jpeg") ||
      fileName.toLowerCase().endsWith(".png") ||
      fileName.toLowerCase().endsWith(".gif") ||
      fileName.toLowerCase().endsWith(".webp")
    )
      return "image";
    return "pdf"; // default
  };

  const getMimeTypeFromFileName = (fileName: string): SupportedMimeType => {
    if (fileName.toLowerCase().endsWith(".pdf")) return "application/pdf";
    if (
      fileName.toLowerCase().endsWith(".xlsx") ||
      fileName.toLowerCase().endsWith(".xls")
    )
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (
      fileName.toLowerCase().endsWith(".docx") ||
      fileName.toLowerCase().endsWith(".doc")
    )
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (
      fileName.toLowerCase().endsWith(".jpg") ||
      fileName.toLowerCase().endsWith(".jpeg") ||
      fileName.toLowerCase().endsWith(".png") ||
      fileName.toLowerCase().endsWith(".gif") ||
      fileName.toLowerCase().endsWith(".webp")
    )
      return "image/jpeg"; // Default to image if not recognized
    return "application/octet-stream"; // Default for unknown types
  };

  // Load data based on context - FIXED: Remove function dependencies
  useEffect(() => {
    const loadData = async () => {
      if (contextId) {
        try {
          switch (contextType) {
            case "Customer":
              await getCustomerAttachments(contextId);
              break;
            case "Vendor":
              await getVendorAttachments(contextId);
              break;
            case "Order":
              await getOrderAttachments(contextId);
              break;
          }
        } catch (error) {
          console.error(
            `Error loading ${contextType.toLowerCase()} attachments:`,
            error
          );
        }
      }
    };

    loadData();
  }, [contextType, contextId]); // Removed function dependencies

  const attachmentData = getContextData();

  const isLoading = loading === "pending";
  const isUploading = uploadLoading === "pending";
  const shouldShowDropZone =
    attachmentData.length === 0 && loading === "fulfilled" && !isUploading;

  const handleSelectAll = () => {
    if (selectedItems.size === attachmentData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(attachmentData.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadProgress(0);
      try {
        let uploadResponse;
        switch (contextType) {
          case "Customer":
            uploadResponse = await uploadCustomerAttachment(contextId, file);
            break;
          case "Vendor":
            uploadResponse = await uploadVendorAttachment(contextId, file);
            break;
          case "Order":
            uploadResponse = await uploadOrderAttachment(contextId, file);
            break;
        }

        // Add the new file to the state instead of reloading
        if (uploadResponse?.data) {
          const newFile = uploadResponse.data;
          const attachmentFile: AttachmentFile = {
            fileName: newFile.fileName,
            fileSize: newFile.fileSize,
            uploadedAt: newFile.uploadedAt,
            filePath: newFile.filePath,
          };

          // The Redux slice will handle adding the file to the state
          // No need to manually refresh the data
        }

        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        });
      }
    },
    [
      contextType,
      contextId,
      uploadCustomerAttachment,
      uploadVendorAttachment,
      uploadOrderAttachment,
      getCustomerAttachments,
      getVendorAttachments,
      getOrderAttachments,
      toast,
    ]
  );

  const handleDelete = useCallback(
    async (fileName: string) => {
      setDeletingFiles((prev) => new Set(prev).add(fileName));
      try {
        switch (contextType) {
          case "Customer":
            await deleteCustomerAttachment(contextId, fileName);
            break;
          case "Vendor":
            await deleteVendorAttachment(contextId, fileName);
            break;
          case "Order":
            await deleteOrderAttachment(contextId, fileName);
            break;
        }
        // Refresh the data after successful delete
        switch (contextType) {
          case "Customer":
            await getCustomerAttachments(contextId);
            break;
          case "Vendor":
            await getVendorAttachments(contextId);
            break;
          case "Order":
            await getOrderAttachments(contextId);
            break;
        }
        toast({
          title: "Delete Successful",
          description: `${fileName} has been deleted successfully.`,
        });
      } catch (error) {
        console.error("Delete failed:", error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeletingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileName);
          return newSet;
        });
      }
    },
    [
      contextType,
      contextId,
      deleteCustomerAttachment,
      deleteVendorAttachment,
      deleteOrderAttachment,
      getCustomerAttachments,
      getVendorAttachments,
      getOrderAttachments,
      toast,
    ]
  );

  const handleViewFile = useCallback(
    (fileName: string, fileType?: string, fileSize?: number) => {
      setPreviewDialog({
        isOpen: true,
        fileName,
        fileType,
        fileSize,
      });
    },
    []
  );

  const handleDownloadFile = useCallback(
    async (fileName: string) => {
      setDownloadingFiles((prev) => new Set(prev).add(fileName));
      try {
        // Construct the file URL based on context
        let fileUrl = "";
        switch (contextType) {
          case "Customer":
            fileUrl = `${apiUrlConstants.uploads}/customers/${contextId}/files/${fileName}`;
            break;
          case "Vendor":
            fileUrl = `${apiUrlConstants.uploads}/vendors/${contextId}/files/${fileName}`;
            break;
          case "Order":
            fileUrl = `${apiUrlConstants.uploads}/orders/${contextId}/files/${fileName}`;
            break;
        }

        // Create a temporary link element to trigger download
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started",
          description: `${fileName} download has started.`,
        });
      } catch (error) {
        console.error("Download failed:", error);
        toast({
          title: "Download Failed",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDownloadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileName);
          return newSet;
        });
      }
    },
    [contextType, contextId, toast]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleUpload(files[0]); // Upload the first file
      }
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleUpload(files[0]);
      }
    },
    [handleUpload]
  );

  const getFileTypeIcon = (fileType: SupportedFileType) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "excel":
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case "word":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "image":
        return <FileImage className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileTypeBadge = (fileType: SupportedFileType) => {
    const colors = {
      pdf: "bg-red-100 text-red-800",
      excel: "bg-green-100 text-green-800",
      word: "bg-blue-100 text-blue-800",
      image: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={cn("text-xs", colors[fileType])}>
        {fileType.toUpperCase()}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredData = attachmentData.filter((item) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      const itemValue = item[key as keyof AttachmentData];
      if (itemValue === undefined) return true;
      return String(itemValue)
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  });

  // Show loading state if loading and there are filtered results
  if (isLoading && filteredData.length > 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
            Loading {contextType.toLowerCase()} attachments...
          </span>
        </div>
      </div>
    );
  }

  // Show loading state if loading and no data yet
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
            Loading {contextType.toLowerCase()} attachments...
          </span>
        </div>
      </div>
    );
  }

  if (error && loading === "rejected") {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-8">
        <div className="text-center text-red-600">
          <p>
            Error loading {contextType.toLowerCase()} attachments: {error}
          </p>
          <Button
            className="mt-4"
            onClick={async () => {
              try {
                switch (contextType) {
                  case "Customer":
                    await getCustomerAttachments(contextId);
                    break;
                  case "Vendor":
                    await getVendorAttachments(contextId);
                    break;
                  case "Order":
                    await getOrderAttachments(contextId);
                    break;
                }
              } catch (error) {
                console.error("Retry failed:", error);
              }
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex-1">
        <div className="flex items-center justify-between flex-1 ">
          <div className="flex items-center gap-3 flex-1 justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Paperclip className="mr-2 h-5 w-5" />
                {title || `${contextType} Attachments`}
              </h2>
              <Badge className={getContextInfo().color}>
                {getContextInfo().type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-mono ms-auto">
                ID: {getContextInfo().id}
              </span>
              {getContextInfo().name !== getContextInfo().id && (
                <span className="text-sm text-gray-600">
                  Name: {getContextInfo().name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload file
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3 border-b bg-gray-50">
        <div className="grid grid-cols-8 gap-2">
          <div className="col-span-1">
            <Input placeholder="" className="h-6 text-xs" disabled />
          </div>
          <div className="col-span-2">
            <Input
              placeholder="File Name"
              className="h-6 text-xs"
              value={filters.fileName}
              onChange={(e) => handleFilterChange("fileName", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Input
              placeholder="Type"
              className="h-6 text-xs"
              value={filters.fileType}
              onChange={(e) => handleFilterChange("fileType", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Input
              placeholder="Category"
              className="h-6 text-xs"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Input
              placeholder="Status"
              className="h-6 text-xs"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Input
              placeholder="Uploaded By"
              className="h-6 text-xs"
              value={filters.uploadedBy}
              onChange={(e) => handleFilterChange("uploadedBy", e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Input placeholder="Date" className="h-6 text-xs" disabled />
          </div>
        </div>
      </div>

      {/* Drop Zone for Empty State */}
      {shouldShowDropZone && (
        <div className="p-8">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {contextType.toLowerCase()} attachments found
            </h3>
            <p className="text-gray-500 mb-6">
              Drag and drop files here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <span className="text-sm text-gray-500">or drag and drop</span>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Supported formats: PDF, Excel, Word, Images (max 10MB)
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileInput}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {filteredData.length > 0 && (
        <div
          className={cn(
            "overflow-x-auto transition-colors relative",
            tableDragOver && "bg-blue-50 border-2 border-blue-300 border-dashed"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setTableDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setTableDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setTableDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
              handleUpload(files[0]);
            }
          }}
        >
          {tableDragOver && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                <p className="text-blue-700 font-medium">Drop file to upload</p>
              </div>
            </div>
          )}
          <div className="min-w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="w-8 p-2 text-xs font-medium text-gray-600">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center w-3 h-3"
                    >
                      {selectedItems.size === attachmentData.length ? (
                        <CheckSquare className="w-3 h-3 text-blue-600" />
                      ) : (
                        <Square className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[120px]">
                    File Name
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[100px]">
                    Type
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[80px]">
                    Category
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[60px]">
                    Status
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[80px]">
                    Uploaded By
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[100px]">
                    Upload Date
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[80px]">
                    Size
                  </TableHead>
                  <TableHead className="p-2 text-xs font-medium text-gray-600 min-w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const isDeleting = deletingFiles.has(item.fileName);
                  const isDownloading = downloadingFiles.has(item.fileName);
                  const isRowDisabled = isDeleting || isDownloading;

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "hover:bg-gray-50 border-b transition-opacity",
                        isRowDisabled && "opacity-50 pointer-events-none"
                      )}
                    >
                      <TableCell className="p-2">
                        <button
                          onClick={() => handleSelectItem(item.id)}
                          className="flex items-center justify-center w-3 h-3"
                          disabled={isRowDisabled}
                        >
                          {selectedItems.has(item.id) ? (
                            <CheckSquare className="w-3 h-3 text-blue-600" />
                          ) : (
                            <Square className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="p-2">
                        <div
                          className="max-w-[120px] truncate"
                          title={item.fileName}
                        >
                          <span className="text-xs font-mono">
                            {item.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          {getFileTypeIcon(item.fileType)}
                          <Badge className="text-xs px-1 py-0.5">
                            {item.fileType.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge
                          className={cn(
                            "text-xs px-1 py-0.5",
                            item.category === "customer"
                              ? "bg-blue-100 text-blue-800"
                              : item.category === "vendor"
                              ? "bg-green-100 text-green-800"
                              : item.category === "order"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                          )}
                        >
                          {item.category.charAt(0).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge
                          className={cn(
                            "text-xs px-1 py-0.5",
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {item.status.charAt(0).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <div
                          className="max-w-[80px] truncate text-xs"
                          title={item.uploadedBy}
                        >
                          {item.uploadedBy}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-gray-600">
                          {formatDate(item.uploadedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-gray-600">
                          {formatFileSize(item.fileSize)}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-blue-100"
                            onClick={() =>
                              handleViewFile(
                                item.fileName,
                                item.fileType,
                                item.fileSize
                              )
                            }
                            disabled={isRowDisabled}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-green-100"
                            onClick={() => handleDownloadFile(item.fileName)}
                            disabled={isRowDisabled}
                          >
                            {isDownloading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-red-600 hover:bg-red-100"
                            onClick={() => handleDelete(item.fileName)}
                            disabled={isRowDisabled}
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        contextType={contextType}
        uploadLoading={uploadLoading}
      />

      {/* File Preview Dialog */}
      <FilePreviewDialog
        isOpen={previewDialog.isOpen}
        onClose={() =>
          setPreviewDialog({
            isOpen: false,
            fileName: "",
            fileType: undefined,
            fileSize: undefined,
          })
        }
        fileName={previewDialog.fileName}
        contextType={contextType}
        contextId={contextId}
        fileType={previewDialog.fileType}
        fileSize={previewDialog.fileSize}
      />
    </div>
  );
};

export default AttachmentModule;
