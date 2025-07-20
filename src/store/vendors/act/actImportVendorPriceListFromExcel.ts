import { vendorServices } from "@/services";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actImportVendorPriceListFromExcel = createAsyncThunk(
  "vendors/actImportVendorPriceListFromExcel",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await vendorServices.importVendorPriceListFromExcel(
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
