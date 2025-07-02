import vendorServices from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { VendorFilters } from "@/types/types";

export const actGetVendors = createAsyncThunk(
  "vendors/actGetVendors",
  async (filters: VendorFilters = {}, { rejectWithValue }) => {
    try {
      const data = await vendorServices.getVendors(filters);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
