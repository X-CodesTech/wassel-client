import { isString, TLoading } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { Vendor, VendorResponse } from "@/types/types";
import { actGetVendors } from "./act/actGetVendors";
import { actSyncVendors } from "./act/actSyncVendors";
import { actCreateVendorPriceList } from "./act/actCreateVendorPriceList";
import { actUpdateVendorPriceList } from "./act/actUpdateVendorPriceList";
import { actDeleteVendorPriceList } from "./act/actDeleteVendorPriceList";
import { actGetVendorPriceLists } from "./act/actGetVendorPriceLists";
import {
  VendorSyncResponse,
  VendorPriceListResponse,
  DeleteVendorPriceListResponse,
} from "@/services/vendorServices";

interface IVendorsState {
  records: Vendor[];
  activeVendorsCount: number;
  blockedVendorsCount: number;
  loading: TLoading;
  error: null | string;
  syncLoading: TLoading;
  syncError: null | string;
  syncStats: VendorSyncResponse["stats"] | null;
  createPriceListLoading: TLoading;
  createPriceListError: null | string;
  createPriceListResponse: VendorPriceListResponse | null;
  updatePriceListLoading: TLoading;
  updatePriceListError: null | string;
  updatePriceListResponse: VendorPriceListResponse | null;
  deletePriceListLoading: TLoading;
  deletePriceListError: null | string;
  deletePriceListResponse: DeleteVendorPriceListResponse | null;
  getPriceListsLoading: TLoading;
  getPriceListsError: null | string;
  priceLists: VendorPriceListResponse["data"] | null;
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
  createPriceListLoading: "idle",
  createPriceListError: null,
  createPriceListResponse: null,
  updatePriceListLoading: "idle",
  updatePriceListError: null,
  updatePriceListResponse: null,
  deletePriceListLoading: "idle",
  deletePriceListError: null,
  deletePriceListResponse: null,
  getPriceListsLoading: "idle",
  getPriceListsError: null,
  priceLists: null,
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
    clearCreatePriceListError: (state) => {
      state.createPriceListError = null;
    },
    clearCreatePriceListResponse: (state) => {
      state.createPriceListResponse = null;
    },
    clearUpdatePriceListError: (state) => {
      state.updatePriceListError = null;
    },
    clearUpdatePriceListResponse: (state) => {
      state.updatePriceListResponse = null;
    },
    clearDeletePriceListError: (state) => {
      state.deletePriceListError = null;
    },
    clearDeletePriceListResponse: (state) => {
      state.deletePriceListResponse = null;
    },
    clearGetPriceListsError: (state) => {
      state.getPriceListsError = null;
    },
    clearPriceLists: (state) => {
      state.priceLists = null;
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

    // Create Vendor Price List
    builder.addCase(actCreateVendorPriceList.pending, (state) => {
      state.createPriceListLoading = "pending";
      state.createPriceListError = null;
    });
    builder.addCase(actCreateVendorPriceList.fulfilled, (state, action) => {
      state.createPriceListLoading = "fulfilled";
      const response: VendorPriceListResponse = action.payload;
      state.createPriceListResponse = response;
    });
    builder.addCase(actCreateVendorPriceList.rejected, (state, action) => {
      state.createPriceListLoading = "rejected";
      if (isString(action.payload)) {
        state.createPriceListError = action.payload;
      }
    });

    // Update Vendor Price List
    builder.addCase(actUpdateVendorPriceList.pending, (state) => {
      state.updatePriceListLoading = "pending";
      state.updatePriceListError = null;
    });
    builder.addCase(actUpdateVendorPriceList.fulfilled, (state, action) => {
      state.updatePriceListLoading = "fulfilled";
      const response: VendorPriceListResponse = action.payload;
      state.updatePriceListResponse = response;
    });
    builder.addCase(actUpdateVendorPriceList.rejected, (state, action) => {
      state.updatePriceListLoading = "rejected";
      if (isString(action.payload)) {
        state.updatePriceListError = action.payload;
      }
    });

    // Delete Vendor Price List
    builder.addCase(actDeleteVendorPriceList.pending, (state) => {
      state.deletePriceListLoading = "pending";
      state.deletePriceListError = null;
    });
    builder.addCase(actDeleteVendorPriceList.fulfilled, (state, action) => {
      state.deletePriceListLoading = "fulfilled";
      const response: DeleteVendorPriceListResponse = action.payload;
      state.deletePriceListResponse = response;
    });
    builder.addCase(actDeleteVendorPriceList.rejected, (state, action) => {
      state.deletePriceListLoading = "rejected";
      if (isString(action.payload)) {
        state.deletePriceListError = action.payload;
      }
    });

    // Get Vendor Price Lists
    builder.addCase(actGetVendorPriceLists.pending, (state) => {
      state.getPriceListsLoading = "pending";
      state.getPriceListsError = null;
    });
    builder.addCase(actGetVendorPriceLists.fulfilled, (state, action) => {
      state.getPriceListsLoading = "fulfilled";
      const response: VendorPriceListResponse = action.payload;
      state.priceLists = response.data;
    });
    builder.addCase(actGetVendorPriceLists.rejected, (state, action) => {
      state.getPriceListsLoading = "rejected";
      if (isString(action.payload)) {
        state.getPriceListsError = action.payload;
      }
    });
  },
});

export const {
  clearVendorsError,
  clearVendorsData,
  clearSyncError,
  clearSyncStats,
  clearCreatePriceListError,
  clearCreatePriceListResponse,
  clearUpdatePriceListError,
  clearUpdatePriceListResponse,
  clearDeletePriceListError,
  clearDeletePriceListResponse,
  clearGetPriceListsError,
  clearPriceLists,
} = vendorsSlice.actions;

export {
  actGetVendors,
  actSyncVendors,
  actCreateVendorPriceList,
  actUpdateVendorPriceList,
  actDeleteVendorPriceList,
  actGetVendorPriceLists,
};

export default vendorsSlice.reducer;
