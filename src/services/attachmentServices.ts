import http from "./http";
import { apiUrlConstants } from "./apiUrlConstants";
import { AxiosResponse } from "axios";

// Base types for attachment responses
export type AttachmentFile = {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  filePath: string;
};

// Base API response structure
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Vendor-specific types
export type VendorInfo = {
  vendAccount: string;
  vendName: string;
};

export type VendorAttachmentData = {
  files: AttachmentFile[];
  vendor: VendorInfo;
};

export type CustomerAttachmentData = {
  files: AttachmentFile[];
  customer?: {
    custAccount: string;
    custName: string;
  };
};

export type OrderAttachmentData = {
  files: AttachmentFile[];
  order?: {
    orderId: string;
    orderNumber: string;
  };
};

// Response types for different contexts
export type VendorAttachmentResponse = ApiResponse<VendorAttachmentData>;
export type CustomerAttachmentResponse = ApiResponse<CustomerAttachmentData>;
export type OrderAttachmentResponse = ApiResponse<OrderAttachmentData>;

// Upload response types for different contexts
export type UploadFileData = {
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: string;
};

export type UploadResponse = ApiResponse<UploadFileData>;

// Legacy types for backward compatibility
export type AttachmentResponse = {
  files: AttachmentFile[];
  total: number;
};

export type LegacyUploadResponse = {
  message: string;
  file: AttachmentFile;
};

export type DeleteResponse = {
  message: string;
};

// Error response types
export type ErrorResponse = {
  message: string;
  error?: string;
  statusCode: number;
};

// File upload types
export type SupportedFileType = "pdf" | "excel" | "word" | "image";
export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/msword"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "application/octet-stream";

// Price list upload types
export type PriceListUploadResponse = {
  message: string;
  uploadedCount: number;
  totalCount: number;
  errors?: string[];
  warnings?: string[];
};

export type PriceListUploadProgress = {
  current: number;
  total: number;
  percentage: number;
  status: "uploading" | "processing" | "completed" | "error";
  message?: string;
};

// Customer attachment services class
export class CustomerAttachmentServices {
  async uploadFile(
    custAccount: string,
    file: File
  ): Promise<AxiosResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    return http.post(
      `${apiUrlConstants.uploads}/customers/${custAccount}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async getFiles(
    custAccount: string
  ): Promise<AxiosResponse<CustomerAttachmentResponse>> {
    return http.get(
      `${apiUrlConstants.uploads}/customers/${custAccount}/files`
    );
  }

  async deleteFile(
    custAccount: string,
    fileName: string
  ): Promise<AxiosResponse<DeleteResponse>> {
    return http.delete(
      `${apiUrlConstants.uploads}/customers/${custAccount}/files/${fileName}`
    );
  }
}

// Vendor attachment services class
export class VendorAttachmentServices {
  async uploadFile(
    vendAccount: string,
    file: File
  ): Promise<AxiosResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    return http.post(
      `${apiUrlConstants.uploads}/vendors/${vendAccount}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async getFiles(
    vendAccount: string
  ): Promise<AxiosResponse<VendorAttachmentResponse>> {
    return http.get(`${apiUrlConstants.uploads}/vendors/${vendAccount}/files`);
  }

  async deleteFile(
    vendAccount: string,
    fileName: string
  ): Promise<AxiosResponse<DeleteResponse>> {
    return http.delete(
      `${apiUrlConstants.uploads}/vendors/${vendAccount}/files/${fileName}`
    );
  }
}

// Order attachment services class
export class OrderAttachmentServices {
  async uploadFile(
    orderId: string,
    file: File
  ): Promise<AxiosResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    return http.post(
      `${apiUrlConstants.uploads}/orders/${orderId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async getFiles(
    orderId: string
  ): Promise<AxiosResponse<OrderAttachmentResponse>> {
    return http.get(`${apiUrlConstants.uploads}/orders/${orderId}/files`);
  }

  async deleteFile(
    orderId: string,
    fileName: string
  ): Promise<AxiosResponse<DeleteResponse>> {
    return http.delete(
      `${apiUrlConstants.uploads}/orders/${orderId}/files/${fileName}`
    );
  }
}

// Price list upload services class
export class PriceListUploadServices {
  async uploadCustomerPriceList(
    file: File,
    socketId?: string
  ): Promise<AxiosResponse<PriceListUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    if (socketId) {
      formData.append("socketId", socketId);
    }

    return http.post(
      `${apiUrlConstants.uploads}/price-lists/customers/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async uploadVendorPriceList(
    file: File,
    socketId?: string
  ): Promise<AxiosResponse<PriceListUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    if (socketId) {
      formData.append("socketId", socketId);
    }

    return http.post(
      `${apiUrlConstants.uploads}/price-lists/vendors/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
}

// Export service instances
export const customerAttachmentServices = new CustomerAttachmentServices();
export const vendorAttachmentServices = new VendorAttachmentServices();
export const orderAttachmentServices = new OrderAttachmentServices();
export const priceListUploadServices = new PriceListUploadServices();

export default {
  customerAttachmentServices,
  vendorAttachmentServices,
  orderAttachmentServices,
  priceListUploadServices,
};
