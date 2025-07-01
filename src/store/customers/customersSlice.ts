import { isString, TLoading } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import {
  Customer,
  CustomerResponse,
  CustomerImportResponse,
} from "@/types/types";
import { actGetCustomers } from "./act/actGetCustomers";
import { actImportCustomers } from "./act/actImportCustomers";

interface ICustomersState {
  records: Customer[];
  loading: TLoading;
  error: null | string;
  importLoading: TLoading;
  importError: null | string;
  importStats: CustomerImportResponse["stats"] | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: ICustomersState = {
  records: [],
  loading: "idle",
  error: null,
  importLoading: "idle",
  importError: null,
  importStats: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCustomersError: (state) => {
      state.error = null;
    },
    clearImportError: (state) => {
      state.importError = null;
    },
    clearCustomersData: (state) => {
      state.records = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    // Get Customers
    builder.addCase(actGetCustomers.pending, (state) => {
      state.loading = "pending";
      state.error = null;
    });
    builder.addCase(actGetCustomers.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      const response: CustomerResponse = action.payload;
      state.records = response.data;
      state.pagination = response.pagination;
    });
    builder.addCase(actGetCustomers.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });

    // Import Customers
    builder.addCase(actImportCustomers.pending, (state) => {
      state.importLoading = "pending";
      state.importError = null;
    });
    builder.addCase(actImportCustomers.fulfilled, (state, action) => {
      state.importLoading = "fulfilled";
      const response: CustomerImportResponse = action.payload;
      state.importStats = response.stats;
    });
    builder.addCase(actImportCustomers.rejected, (state, action) => {
      state.importLoading = "rejected";
      if (isString(action.payload)) {
        state.importError = action.payload;
      }
    });
  },
});

export const { clearCustomersError, clearImportError, clearCustomersData } =
  customersSlice.actions;

export { actGetCustomers, actImportCustomers };

export default customersSlice.reducer;
