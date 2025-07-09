import vendorServices, {
  CreateVendorPriceListRequest,
} from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actCreateVendorPriceList = createAsyncThunk(
  "vendors/actCreateVendorPriceList",
  async (data: CreateVendorPriceListRequest, { rejectWithValue }) => {
    try {
      const response = await vendorServices.createVendorPriceList(data);
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
