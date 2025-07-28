import { createAsyncThunk } from "@reduxjs/toolkit";
import { vendorAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actDeleteVendorAttachment = createAsyncThunk(
  "attachments/deleteVendorAttachment",
  async (
    { vendAccount, fileName }: { vendAccount: string; fileName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await vendorAttachmentServices.deleteFile(
        vendAccount,
        fileName
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
