import { transactionTypesServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actAddTransactionType = createAsyncThunk(
  "transactionTypes/actAddTransactionType",
  async (name: string, { rejectWithValue }) => {
    try {
      const { data } = await transactionTypesServices.addTransactionType(name);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
