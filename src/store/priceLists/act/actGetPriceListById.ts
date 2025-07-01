import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetPriceListById = createAsyncThunk(
  "priceLists/actGetPriceListById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await priceListServices.getPriceListById(id);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
