import vendorServices, {
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actUpdateVendorPriceList = createAsyncThunk(
  "vendors/actUpdateVendorPriceList",
  async (data: UpdateVendorPriceListRequest, { rejectWithValue }) => {
    try {
      const response = await vendorServices.updateVendorPriceList(data);
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
