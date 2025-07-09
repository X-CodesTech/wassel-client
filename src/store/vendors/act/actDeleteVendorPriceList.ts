import vendorServices, {
  DeleteVendorPriceListResponse,
} from "@/services/vendorServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actDeleteVendorPriceList = createAsyncThunk(
  "vendors/actDeleteVendorPriceList",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await vendorServices.deleteVendorPriceList(id);
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
