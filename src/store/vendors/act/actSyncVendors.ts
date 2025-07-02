import vendorServices from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actSyncVendors = createAsyncThunk(
  "vendors/actSyncVendors",
  async (_, { rejectWithValue }) => {
    try {
      const data = await vendorServices.syncVendors();
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
