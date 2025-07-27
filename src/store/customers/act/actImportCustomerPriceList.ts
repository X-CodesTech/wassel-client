import { customerServices } from "@/services";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actImportCustomerPriceList = createAsyncThunk(
  "customers/importCustomerPriceList",
  async (
    { customerId, formData }: { customerId: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await customerServices.importCustomerPriceList(
        customerId,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
