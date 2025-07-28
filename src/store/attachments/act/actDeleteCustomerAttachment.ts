import { createAsyncThunk } from "@reduxjs/toolkit";
import { customerAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actDeleteCustomerAttachment = createAsyncThunk(
  "attachments/deleteCustomerAttachment",
  async (
    { custAccount, fileName }: { custAccount: string; fileName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await customerAttachmentServices.deleteFile(
        custAccount,
        fileName
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
