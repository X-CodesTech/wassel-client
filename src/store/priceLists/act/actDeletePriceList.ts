import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actDeletePriceList = createAsyncThunk(
  "priceLists/actDeletePriceList",
  async (id: string, { rejectWithValue }) => {
    try {
      await priceListServices.deletePriceList(id);
      return id;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
