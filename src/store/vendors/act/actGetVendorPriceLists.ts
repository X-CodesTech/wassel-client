import vendorServices from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetVendorPriceLists = createAsyncThunk(
  "vendors/actGetVendorPriceLists",
  async (vendorId: string, { rejectWithValue }) => {
    try {
      const response = await vendorServices.getVendorPriceLists(vendorId);
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
