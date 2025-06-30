import customerServices from "@/services/customerServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CustomerFilters } from "@/types/types";

export const actGetCustomers = createAsyncThunk(
  "customers/actGetCustomers",
  async (filters: CustomerFilters = {}, { rejectWithValue }) => {
    try {
      const data = await customerServices.getCustomers(filters);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
