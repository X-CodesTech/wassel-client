import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetPriceLists = createAsyncThunk(
  "priceLists/actGetPriceLists",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await priceListServices.getPriceLists();
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
