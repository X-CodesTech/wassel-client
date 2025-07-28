import { createAsyncThunk } from "@reduxjs/toolkit";
import { vendorAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actUploadVendorAttachment = createAsyncThunk(
  "attachments/uploadVendorAttachment",
  async (
    { vendAccount, file }: { vendAccount: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      const response = await vendorAttachmentServices.uploadFile(
        vendAccount,
        file
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
