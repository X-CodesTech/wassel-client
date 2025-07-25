import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface DeleteSubActivityParams {
  priceListId: string;
  subActivityId: string;
}

export const actDeleteSubActivityFromPriceList = createAsyncThunk(
  "priceLists/actDeleteSubActivityFromPriceList",
  async (
    { priceListId, subActivityId }: DeleteSubActivityParams,
    { rejectWithValue }
  ) => {
    try {
      await priceListServices.deleteSubActivityFromPriceList(
        priceListId,
        subActivityId
      );
      return { priceListId, subActivityId };
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
