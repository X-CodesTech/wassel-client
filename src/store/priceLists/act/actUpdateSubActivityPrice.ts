import { createAsyncThunk } from "@reduxjs/toolkit";
import priceListServices, {
  PricingMethod,
  LocationPrice,
} from "@/services/priceListServices";

interface UpdateSubActivityPriceParams {
  priceListId: string;
  subActivityId: string;
  data: {
    basePrice?: number;
    locationPrices?: LocationPrice[];
  };
}

export const actUpdateSubActivityPrice = createAsyncThunk(
  "priceLists/updateSubActivityPrice",
  async (params: UpdateSubActivityPriceParams, { rejectWithValue }) => {
    try {
      const response = await priceListServices.updateSubActivityPrice(
        params.priceListId,
        params.subActivityId,
        params.data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subactivity price"
      );
    }
  }
);
