import { isString, TLoading } from "@/types";
import { TransactionType } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";
import { actGetTransactionTypes } from "./act/actGetTransactionTypes";
import { actAddTransactionType } from "./act/actAddTransactionType";

interface ITransactionTypesState {
  records: TransactionType[];
  loading: TLoading;
  error: null | string;
}

const initialState: ITransactionTypesState = {
  records: [],
  loading: "idle",
  error: null,
};

const transactionTypesSlice = createSlice({
  name: "transactionTypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(actGetTransactionTypes.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actGetTransactionTypes.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = action.payload.data;
    });
    builder.addCase(actGetTransactionTypes.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
    builder.addCase(actAddTransactionType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actAddTransactionType.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = [...state.records, action.payload.data];
    });
    builder.addCase(actAddTransactionType.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
  },
});

export const {} = transactionTypesSlice.actions;

export { actGetTransactionTypes, actAddTransactionType };

export default transactionTypesSlice.reducer;
