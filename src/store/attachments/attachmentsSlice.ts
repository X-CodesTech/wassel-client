import { isString, TLoading } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AttachmentFile } from "@/services/attachmentServices";
import {
  actGetCustomerAttachments,
  actUploadCustomerAttachment,
  actDeleteCustomerAttachment,
  actGetVendorAttachments,
  actUploadVendorAttachment,
  actDeleteVendorAttachment,
  actGetOrderAttachments,
  actUploadOrderAttachment,
  actDeleteOrderAttachment,
} from "./act";

interface IAttachmentsState {
  customerFiles: AttachmentFile[];
  vendorFiles: AttachmentFile[];
  orderFiles: AttachmentFile[];
  loading: TLoading;
  error: null | string;
  uploadLoading: TLoading;
  uploadError: null | string;
  uploadSuccess: null | string;
  deleteLoading: TLoading;
  deleteError: null | string;
  deleteSuccess: null | string;
}

const initialState: IAttachmentsState = {
  customerFiles: [],
  vendorFiles: [],
  orderFiles: [],
  loading: "idle",
  error: null,
  uploadLoading: "idle",
  uploadError: null,
  uploadSuccess: null,
  deleteLoading: "idle",
  deleteError: null,
  deleteSuccess: null,
};

const attachmentsSlice = createSlice({
  name: "attachments",
  initialState,
  reducers: {
    setCustomerFiles: (state, action: PayloadAction<AttachmentFile[]>) => {
      state.customerFiles = action.payload;
    },
    setVendorFiles: (state, action: PayloadAction<AttachmentFile[]>) => {
      state.vendorFiles = action.payload;
    },
    setOrderFiles: (state, action: PayloadAction<AttachmentFile[]>) => {
      state.orderFiles = action.payload;
    },
    addCustomerFile: (state, action: PayloadAction<AttachmentFile>) => {
      state.customerFiles.push(action.payload);
    },
    addVendorFile: (state, action: PayloadAction<AttachmentFile>) => {
      state.vendorFiles.push(action.payload);
    },
    addOrderFile: (state, action: PayloadAction<AttachmentFile>) => {
      state.orderFiles.push(action.payload);
    },
    removeCustomerFile: (state, action: PayloadAction<string>) => {
      state.customerFiles = state.customerFiles.filter(
        (file) => file.fileName !== action.payload
      );
    },
    removeVendorFile: (state, action: PayloadAction<string>) => {
      state.vendorFiles = state.vendorFiles.filter(
        (file) => file.fileName !== action.payload
      );
    },
    removeOrderFile: (state, action: PayloadAction<string>) => {
      state.orderFiles = state.orderFiles.filter(
        (file) => file.fileName !== action.payload
      );
    },
    clearAttachmentsError: (state) => {
      state.error = null;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearDeleteSuccess: (state) => {
      state.deleteSuccess = null;
    },
    clearAttachmentsData: (state) => {
      state.customerFiles = [];
      state.vendorFiles = [];
      state.orderFiles = [];
    },
  },
  extraReducers: (builder) => {
    // Customer attachments
    builder
      .addCase(actGetCustomerAttachments.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(actGetCustomerAttachments.fulfilled, (state, action) => {
        state.loading = "fulfilled";
        state.customerFiles = action.payload.data.files;
      })
      .addCase(actGetCustomerAttachments.rejected, (state, action) => {
        state.loading = "rejected";
        state.error =
          action.error.message || "Failed to get customer attachments";
      })
      .addCase(actUploadCustomerAttachment.pending, (state) => {
        state.uploadLoading = "pending";
        state.uploadError = null;
      })
      .addCase(actUploadCustomerAttachment.fulfilled, (state, action) => {
        state.uploadLoading = "fulfilled";
        state.uploadSuccess = action.payload.message;
        // Add the new file to customer files
        if (action.payload.data) {
          const newFile: AttachmentFile = {
            fileName: action.payload.data.fileName,
            fileSize: action.payload.data.fileSize,
            uploadedAt: action.payload.data.uploadedAt,
            filePath: action.payload.data.filePath,
          };
          state.customerFiles.push(newFile);
        }
      })
      .addCase(actUploadCustomerAttachment.rejected, (state, action) => {
        state.uploadLoading = "rejected";
        state.uploadError =
          action.error.message || "Failed to upload customer attachment";
      })
      .addCase(actDeleteCustomerAttachment.pending, (state) => {
        state.deleteLoading = "pending";
        state.deleteError = null;
      })
      .addCase(actDeleteCustomerAttachment.fulfilled, (state) => {
        state.deleteLoading = "fulfilled";
      })
      .addCase(actDeleteCustomerAttachment.rejected, (state, action) => {
        state.deleteLoading = "rejected";
        state.deleteError =
          action.error.message || "Failed to delete customer attachment";
      });

    // Vendor attachments
    builder
      .addCase(actGetVendorAttachments.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(actGetVendorAttachments.fulfilled, (state, action) => {
        state.loading = "fulfilled";
        state.vendorFiles = action.payload.data.files;
      })
      .addCase(actGetVendorAttachments.rejected, (state, action) => {
        state.loading = "rejected";
        state.error =
          action.error.message || "Failed to get vendor attachments";
      })
      .addCase(actUploadVendorAttachment.pending, (state) => {
        state.uploadLoading = "pending";
        state.uploadError = null;
      })
      .addCase(actUploadVendorAttachment.fulfilled, (state, action) => {
        state.uploadLoading = "fulfilled";
        state.uploadSuccess = action.payload.message;
        // Add the new file to vendor files
        if (action.payload.data) {
          const newFile: AttachmentFile = {
            fileName: action.payload.data.fileName,
            fileSize: action.payload.data.fileSize,
            uploadedAt: action.payload.data.uploadedAt,
            filePath: action.payload.data.filePath,
          };
          state.vendorFiles.push(newFile);
        }
      })
      .addCase(actUploadVendorAttachment.rejected, (state, action) => {
        state.uploadLoading = "rejected";
        state.uploadError =
          action.error.message || "Failed to upload vendor attachment";
      })
      .addCase(actDeleteVendorAttachment.pending, (state) => {
        state.deleteLoading = "pending";
        state.deleteError = null;
      })
      .addCase(actDeleteVendorAttachment.fulfilled, (state) => {
        state.deleteLoading = "fulfilled";
      })
      .addCase(actDeleteVendorAttachment.rejected, (state, action) => {
        state.deleteLoading = "rejected";
        state.deleteError =
          action.error.message || "Failed to delete vendor attachment";
      });

    // Order attachments
    builder
      .addCase(actGetOrderAttachments.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(actGetOrderAttachments.fulfilled, (state, action) => {
        state.loading = "fulfilled";
        state.orderFiles = action.payload.data.files;
      })
      .addCase(actGetOrderAttachments.rejected, (state, action) => {
        state.loading = "rejected";
        state.error = action.error.message || "Failed to get order attachments";
      })
      .addCase(actUploadOrderAttachment.pending, (state) => {
        state.uploadLoading = "pending";
        state.uploadError = null;
      })
      .addCase(actUploadOrderAttachment.fulfilled, (state, action) => {
        state.uploadLoading = "fulfilled";
        state.uploadSuccess = action.payload.message;
        // Add the new file to order files
        if (action.payload.data) {
          const newFile: AttachmentFile = {
            fileName: action.payload.data.fileName,
            fileSize: action.payload.data.fileSize,
            uploadedAt: action.payload.data.uploadedAt,
            filePath: action.payload.data.filePath,
          };
          state.orderFiles.push(newFile);
        }
      })
      .addCase(actUploadOrderAttachment.rejected, (state, action) => {
        state.uploadLoading = "rejected";
        state.uploadError =
          action.error.message || "Failed to upload order attachment";
      })
      .addCase(actDeleteOrderAttachment.pending, (state) => {
        state.deleteLoading = "pending";
        state.deleteError = null;
      })
      .addCase(actDeleteOrderAttachment.fulfilled, (state) => {
        state.deleteLoading = "fulfilled";
      })
      .addCase(actDeleteOrderAttachment.rejected, (state, action) => {
        state.deleteLoading = "rejected";
        state.deleteError =
          action.error.message || "Failed to delete order attachment";
      });
  },
});

export const {
  setCustomerFiles,
  setVendorFiles,
  setOrderFiles,
  addCustomerFile,
  addVendorFile,
  addOrderFile,
  removeCustomerFile,
  removeVendorFile,
  removeOrderFile,
  clearAttachmentsError,
  clearUploadError,
  clearUploadSuccess,
  clearDeleteError,
  clearDeleteSuccess,
  clearAttachmentsData,
} = attachmentsSlice.actions;

export default attachmentsSlice.reducer;
