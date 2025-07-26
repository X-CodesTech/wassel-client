import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetPriceLists = createAsyncThunk(
  "priceLists/actGetPriceLists",
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await priceListServices.getPriceLists(page, limit);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
