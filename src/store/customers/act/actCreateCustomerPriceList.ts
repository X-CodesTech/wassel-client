import { createAsyncThunk } from "@reduxjs/toolkit";
import { customerServices } from "@/services";
import { PriceList } from "@/services/customerServices";
import { axiosErrorHandler } from "@/utils/axiosErrorHandler";

export const actCreateCustomerPriceList = createAsyncThunk(
  "customers/actCreateCustomerPriceList",
  async (
    param: { customerId: string; priceListData: Partial<PriceList> },
    { rejectWithValue }
  ) => {
    try {
      const response = await customerServices.createCustomerPriceList(param);
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
