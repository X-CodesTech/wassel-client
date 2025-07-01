import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PriceList } from "@/services/priceListServices";

interface UpdatePriceListParams {
  id: string;
  priceList: PriceList;
}

export const actUpdatePriceList = createAsyncThunk(
  "priceLists/actUpdatePriceList",
  async ({ id, priceList }: UpdatePriceListParams, { rejectWithValue }) => {
    try {
      const { data } = await priceListServices.updatePriceList(id, priceList);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
