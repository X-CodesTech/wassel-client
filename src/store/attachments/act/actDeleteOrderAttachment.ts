import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actDeleteOrderAttachment = createAsyncThunk(
  "attachments/deleteOrderAttachment",
  async (
    { orderId, fileName }: { orderId: string; fileName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderAttachmentServices.deleteFile(
        orderId,
        fileName
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
