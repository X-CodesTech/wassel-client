import { transactionTypesServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actDeleteTransactionType = createAsyncThunk(
  "transactionTypes/actDeleteTransactionType",
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionTypesServices.deleteTransactionType(id);
      return id;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
