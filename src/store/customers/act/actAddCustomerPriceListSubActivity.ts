import { createAsyncThunk } from "@reduxjs/toolkit";
import priceListServices from "@/services/priceListServices";
import { axiosErrorHandler } from "@/utils";
import {
  TCustomerPriceListBody,
  TPricingMethod,
} from "@/types/customerPriceList.type";

export const actAddCustomerPriceListSubActivity = createAsyncThunk(
  "customers/addCustomerPriceListSubActivity",
  async (
    data: TCustomerPriceListBody<TPricingMethod> & {
      priceListId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await priceListServices.addSubActivityToPriceList(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
