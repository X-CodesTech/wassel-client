import customerServices from "@/services/customerServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actImportCustomers = createAsyncThunk(
  "customers/actImportCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerServices.importCustomers();
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
