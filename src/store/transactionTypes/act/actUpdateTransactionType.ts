import { transactionTypesServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface UpdateTransactionTypeParams {
  id: string;
  name: string;
}

export const actUpdateTransactionType = createAsyncThunk(
  "transactionTypes/actUpdateTransactionType",
  async ({ id, name }: UpdateTransactionTypeParams, { rejectWithValue }) => {
    try {
      const { data } = await transactionTypesServices.updateTransactionType(
        id,
        name
      );
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
