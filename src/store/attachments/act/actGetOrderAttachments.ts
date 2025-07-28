import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderAttachmentServices } from "@/services/attachmentServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actGetOrderAttachments = createAsyncThunk(
  "attachments/getOrderAttachments",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderAttachmentServices.getFiles(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
