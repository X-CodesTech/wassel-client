import { vendorServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actDeleteVendorSubActivityPrice = createAsyncThunk(
  "vendors/actDeleteVendorSubActivityPrice",
  async (
    data: { vendorPriceListId: string; subActivityPriceId: string },
    { rejectWithValue }
  ) => {
    const { vendorPriceListId, subActivityPriceId } = data;

    try {
      const response = await vendorServices.deleteSubActivityPrice(
        vendorPriceListId,
        subActivityPriceId
      );
      return response;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
