import customerServices from "@/services/customerServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetCustomer = createAsyncThunk(
  "customers/actGetCustomer",
  async (custAccount: string, { rejectWithValue }) => {
    try {
      const response = await customerServices.getCustomerDetails(custAccount);
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
