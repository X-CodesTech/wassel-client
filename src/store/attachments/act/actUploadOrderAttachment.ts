import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actUploadOrderAttachment = createAsyncThunk(
  "attachments/uploadOrderAttachment",
  async (
    { orderId, file }: { orderId: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderAttachmentServices.uploadFile(orderId, file);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
