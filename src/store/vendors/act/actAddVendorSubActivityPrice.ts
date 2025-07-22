import { vendorServices } from "@/services";
import {
  AddSubActivityPriceRequest,
  PricingMethod,
} from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actAddVendorSubActivityPrice = createAsyncThunk(
  "vendors/actAddVendorSubActivityPrice",
  async (
    data: AddSubActivityPriceRequest<PricingMethod> & { id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await vendorServices.addSubActivityPrice(data);
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
