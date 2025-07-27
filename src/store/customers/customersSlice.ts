import { isString, TLoading } from "@/types";
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import {
  Customer,
  CustomerResponse,
  CustomerImportResponse,
} from "@/types/types";
import { actGetCustomers } from "./act/actGetCustomers";
import { actImportCustomers } from "./act/actImportCustomers";
import { actGetCustomer } from "./act/actGetCustomer";
import {
  CustomerPriceListResponse,
  SubActivityPrice,
} from "@/services/customerServices";
import { actAddCustomerPriceListSubActivity } from "./act/actAddCustomerPriceListSubActivity";
import { actDeleteCustomerPriceListSubActivity } from "./act/actDeleteCustomerPriceListSubActivity.ts";

interface ICustomersState {
  records: Customer[];
  selectedCustomer:
    | (Customer & { priceLists: CustomerPriceListResponse[] })
    | null;
  loading: TLoading;
  error: null | string;
  importLoading: TLoading;
  importError: null | string;
  importStats: CustomerImportResponse["stats"] | null;
  addPriceListSubActivityLoading: TLoading;
  addPriceListSubActivityError: null | string;
  deletePriceListSubActivityLoading: TLoading;
  deletePriceListSubActivityError: null | string;
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
  addPriceListSubActivityLoading: "idle",
  addPriceListSubActivityError: null,
  deletePriceListSubActivityLoading: "idle",
  deletePriceListSubActivityError: null,
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
      state.selectedCustomer = { ...action.payload, priceLists: [] };
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
    removePriceListSubActivity: (
      state,
      action: PayloadAction<{
        priceListId: string;
        subActivityId: string;
      }>
    ) => {
      const { priceListId, subActivityId } = action.payload;

      if (state.selectedCustomer) {
        const priceListIndex = state.selectedCustomer.priceLists.findIndex(
          (priceList) => priceList.priceList._id === priceListId
        );

        if (priceListIndex !== -1) {
          state.selectedCustomer.priceLists[
            priceListIndex
          ].priceList.subActivityPrices = state.selectedCustomer.priceLists[
            priceListIndex
          ].priceList.subActivityPrices.filter(
            (subActivity) => subActivity._id !== subActivityId
          );
        }

        if (
          state.selectedCustomer.priceLists[priceListIndex].priceList
            .subActivityPrices.length === 0
        ) {
          state.selectedCustomer.priceLists.splice(priceListIndex, 1);
        }
      }
    },
    addPriceListSubActivity: (
      state,
      action: PayloadAction<{
        priceListId: string;
        subActivityPrices: SubActivityPrice[];
      }>
    ) => {
      if (state.selectedCustomer) {
        state.selectedCustomer.priceLists.find(
          (priceList) => priceList.priceList._id === action.payload.priceListId
        )!.priceList.subActivityPrices = action.payload.subActivityPrices;
      }
    },
    updateCustomerPriceListSubActivity: (
      state,
      action: PayloadAction<{
        priceListId: string;
        subActivityId: string;
        data: Partial<SubActivityPrice>;
      }>
    ) => {
      const { priceListId, subActivityId, data } = action.payload;

      const priceListIndex = state.selectedCustomer?.priceLists.findIndex(
        (priceList) => priceList.priceList._id === priceListId
      );

      const priceList = state.selectedCustomer?.priceLists[priceListIndex!];

      // priceLists[0].priceList.subActivityPrices[1].subActivity._id

      const subActivityIndex = priceList?.priceList.subActivityPrices.findIndex(
        (sa) => sa.subActivity._id === subActivityId
      );

      const subActivity =
        priceList?.priceList.subActivityPrices[subActivityIndex!];

      if (subActivity) {
        state.selectedCustomer!.priceLists[
          priceListIndex!
        ].priceList.subActivityPrices[subActivityIndex!] = {
          ...subActivity,
          ...data,
        };
      }
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
      const response = action.payload;
      state.selectedCustomer = response.data;
    });
    builder.addCase(actGetCustomer.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });

    // Add Customer Price List Sub Activity
    builder.addCase(actAddCustomerPriceListSubActivity.pending, (state) => {
      state.addPriceListSubActivityLoading = "pending";
      state.addPriceListSubActivityError = null;
    });
    builder.addCase(
      actAddCustomerPriceListSubActivity.fulfilled,
      (state, action) => {
        state.addPriceListSubActivityLoading = "fulfilled";
        state.selectedCustomer.priceLists = action.payload.subActivityPrices!;
      }
    );
    builder.addCase(
      actAddCustomerPriceListSubActivity.rejected,
      (state, action) => {
        state.addPriceListSubActivityLoading = "rejected";
        if (isString(action.payload)) {
          state.addPriceListSubActivityError = action.payload;
        }
      }
    );

    // Delete Customer Price List Sub Activity
    builder.addCase(actDeleteCustomerPriceListSubActivity.pending, (state) => {
      state.deletePriceListSubActivityLoading = "pending";
      state.deletePriceListSubActivityError = null;
    });
    builder.addCase(
      actDeleteCustomerPriceListSubActivity.fulfilled,
      (state, action) => {
        state.deletePriceListSubActivityLoading = "fulfilled";
        console.log(action.payload);

        // console.log(current([0].priceList._id));

        state.selectedCustomer.priceLists.filter(
          (priceList) => priceList.priceList._id !== action.payload.priceListId
        );
      }
    );
    builder.addCase(
      actDeleteCustomerPriceListSubActivity.rejected,
      (state, action) => {
        state.deletePriceListSubActivityLoading = "rejected";
        if (isString(action.payload)) {
          state.deletePriceListSubActivityError = action.payload;
        }
      }
    );
  },
});

export const {
  clearCustomersError,
  clearImportError,
  clearCustomersData,
  setSelectedCustomer,
  clearSelectedCustomer,
  addPriceListSubActivity,
  removePriceListSubActivity,
  updateCustomerPriceListSubActivity,
} = customersSlice.actions;

export {
  actGetCustomers,
  actImportCustomers,
  actGetCustomer,
  actAddCustomerPriceListSubActivity,
  actDeleteCustomerPriceListSubActivity,
};

export default customersSlice.reducer;
