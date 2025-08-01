import { isString, TLoading } from "@/types";
import { TransactionType } from "@/types/types";
import { createSlice } from "@reduxjs/toolkit";
import { actGetTransactionTypes } from "./act/actGetTransactionTypes";
import { actAddTransactionType } from "./act/actAddTransactionType";
import { actUpdateTransactionType } from "./act/actUpdateTransactionType";
import { actDeleteTransactionType } from "./act/actDeleteTransactionType";

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
    builder.addCase(actUpdateTransactionType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actUpdateTransactionType.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = state.records.map((record) =>
        record._id === action.payload.data._id ? action.payload.data : record
      );
    });
    builder.addCase(actUpdateTransactionType.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
    builder.addCase(actDeleteTransactionType.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actDeleteTransactionType.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = state.records.filter(
        (record) => record._id !== action.payload
      );
    });
    builder.addCase(actDeleteTransactionType.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
  },
});

export const {} = transactionTypesSlice.actions;

export {
  actGetTransactionTypes,
  actAddTransactionType,
  actUpdateTransactionType,
  actDeleteTransactionType,
};

export default transactionTypesSlice.reducer;
