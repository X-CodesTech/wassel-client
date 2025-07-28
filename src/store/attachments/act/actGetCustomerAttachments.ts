import { createAsyncThunk } from "@reduxjs/toolkit";
import { customerAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actGetCustomerAttachments = createAsyncThunk(
  "attachments/getCustomerAttachments",
  async (custAccount: string, { rejectWithValue }) => {
    try {
      const response = await customerAttachmentServices.getFiles(custAccount);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
