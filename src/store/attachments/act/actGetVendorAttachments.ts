import { createAsyncThunk } from "@reduxjs/toolkit";
import { vendorAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actGetVendorAttachments = createAsyncThunk(
  "attachments/getVendorAttachments",
  async (vendAccount: string, { rejectWithValue }) => {
    try {
      const response = await vendorAttachmentServices.getFiles(vendAccount);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
