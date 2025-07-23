import { createAsyncThunk } from "@reduxjs/toolkit";
import vendorService, { PricingMethod } from "@/services/vendorServices";
import { type TPriceBody } from "@/types/vendorPriceListEditTypes";

export const actEditVendorSubActivityPrice = createAsyncThunk(
  "vendors/editVendorSubActivityPrice",
  async (data: TPriceBody<PricingMethod>, { rejectWithValue }) => {
    try {
      const response = await vendorService.editVendorSubActivityPrice(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
