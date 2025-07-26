import priceListServices from "@/services/priceListServices";
import { TPriceBody, TPriceMethod } from "@/types/vendorPriceListEditTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/utils";

export const actAddPriceListSubActivity = createAsyncThunk(
  "priceLists/addPriceListSubActivity",
  async (data: TPriceBody<TPriceMethod>, { rejectWithValue }) => {
    try {
      const response = await priceListServices.addSubActivityToPriceList(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
