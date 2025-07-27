import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/utils";
import priceListServices from "@/services/priceListServices.ts";

export const actDeleteCustomerPriceListSubActivity = createAsyncThunk(
  "customers/deleteCustomerPriceListSubActivity",
  async (
    data: { subActivityId: string; priceListId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await priceListServices.deleteSubActivityFromPriceList(
        data.priceListId,
        data.subActivityId
      );
      return {
        data: response.data.data,
        _id: data.subActivityId,
        priceListId: data.priceListId,
      };
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
