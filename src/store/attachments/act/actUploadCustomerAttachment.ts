import { createAsyncThunk } from "@reduxjs/toolkit";
import { customerAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actUploadCustomerAttachment = createAsyncThunk(
  "attachments/uploadCustomerAttachment",
  async (
    { custAccount, file }: { custAccount: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      const response = await customerAttachmentServices.uploadFile(
        custAccount,
        file
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
