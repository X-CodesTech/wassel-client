import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PriceList } from "@/services/priceListServices";

export const actAddPriceList = createAsyncThunk(
  "priceLists/actAddPriceList",
  async (priceList: PriceList, { rejectWithValue }) => {
    try {
      const { data } = await priceListServices.createPriceList(priceList);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
