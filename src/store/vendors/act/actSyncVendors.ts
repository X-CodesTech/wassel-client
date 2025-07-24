import vendorServices from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actSyncVendors = createAsyncThunk(
  "vendors/actSyncVendors",
  async (_, { rejectWithValue }) => {
    try {
      return await vendorServices.syncVendors();
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
