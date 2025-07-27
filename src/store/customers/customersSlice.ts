import { isString, TLoading } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Customer,
  CustomerResponse,
  CustomerImportResponse,
} from "@/types/types";
import { actGetCustomers } from "./act/actGetCustomers";
import { actImportCustomers } from "./act/actImportCustomers";
import { actGetCustomer } from "./act/actGetCustomer";

interface ICustomersState {
  records: Customer[];
  selectedCustomer: Customer | null;
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
  selectedCustomer: null,
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
    setSelectedCustomer: (state, action: PayloadAction<Customer>) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
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

    // Get Customer Details
    builder.addCase(actGetCustomer.pending, (state) => {
      state.loading = "pending";
      state.error = null;
    });
    builder.addCase(actGetCustomer.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      const customer: Customer = action.payload.data;
      state.selectedCustomer = customer;
    });
    builder.addCase(actGetCustomer.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
  },
});

export const {
  clearCustomersError,
  clearImportError,
  clearCustomersData,
  setSelectedCustomer,
  clearSelectedCustomer,
} = customersSlice.actions;

export { actGetCustomers, actImportCustomers, actGetCustomer };

export default customersSlice.reducer;
