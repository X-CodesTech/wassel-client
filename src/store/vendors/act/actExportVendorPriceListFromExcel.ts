import { vendorServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actExportVendorPriceListAsExcel = createAsyncThunk(
  "vendors/actExportVendorPriceListAsExcel",
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await vendorServices.exportVendorPriceListAsExcel({
        id,
        isActive,
      });
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
