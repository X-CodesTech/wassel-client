import { isString, TLoading } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { Vendor, VendorResponse } from "@/types/types";
import { actGetVendors } from "./act/actGetVendors";
import { actSyncVendors } from "./act/actSyncVendors";
import { VendorSyncResponse } from "@/services/vendorServices";

interface IVendorsState {
  records: Vendor[];
  activeVendorsCount: number;
  blockedVendorsCount: number;
  loading: TLoading;
  error: null | string;
  syncLoading: TLoading;
  syncError: null | string;
  syncStats: VendorSyncResponse["stats"] | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: IVendorsState = {
  records: [],
  loading: "idle",
  activeVendorsCount: 0,
  blockedVendorsCount: 0,
  error: null,
  syncLoading: "idle",
  syncError: null,
  syncStats: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearVendorsError: (state) => {
      state.error = null;
    },
    clearVendorsData: (state) => {
      state.records = [];
      state.pagination = initialState.pagination;
    },
    clearSyncError: (state) => {
      state.syncError = null;
    },
    clearSyncStats: (state) => {
      state.syncStats = null;
    },
  },
  extraReducers: (builder) => {
    // Get Vendors
    builder.addCase(actGetVendors.pending, (state) => {
      state.loading = "pending";
      state.error = null;
    });
    builder.addCase(actGetVendors.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      const response: VendorResponse = action.payload;
      state.records = response.data;
      state.pagination = response.pagination;
      state.activeVendorsCount = response.activeVendorsCount;
      state.blockedVendorsCount =
        response.pagination.total - response.activeVendorsCount;
    });
    builder.addCase(actGetVendors.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });

    // Sync Vendors
    builder.addCase(actSyncVendors.pending, (state) => {
      state.syncLoading = "pending";
      state.syncError = null;
    });
    builder.addCase(actSyncVendors.fulfilled, (state, action) => {
      state.syncLoading = "fulfilled";
      const response: VendorSyncResponse = action.payload;
      state.syncStats = response.stats;
    });
    builder.addCase(actSyncVendors.rejected, (state, action) => {
      state.syncLoading = "rejected";
      if (isString(action.payload)) {
        state.syncError = action.payload;
      }
    });
  },
});

export const {
  clearVendorsError,
  clearVendorsData,
  clearSyncError,
  clearSyncStats,
} = vendorsSlice.actions;

export { actGetVendors, actSyncVendors };

export default vendorsSlice.reducer;
