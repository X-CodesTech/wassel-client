import { transactionTypesServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetTransactionTypes = createAsyncThunk(
  "transactionTypes/actGetTransactionTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await transactionTypesServices.getTransactionTypes();
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
