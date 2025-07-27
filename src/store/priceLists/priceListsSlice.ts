import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PriceList } from "@/services/priceListServices";
import {
  actGetPriceLists,
  actAddPriceList,
  actUpdatePriceList,
  actDeletePriceList,
  actGetPriceListById,
  actDeleteSubActivityFromPriceList,
  actUpdateSubActivityPrice,
  actAddPriceListSubActivity,
} from "./act";

interface PriceListsState {
  records: PriceList[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalItems: number;
    totalPages: number;
  } | null;
  selectedPriceList: PriceList | null;
  loading: boolean;
  error: string | null;
  deleteSubActivityLoading: boolean;
  updateSubActivityLoading: boolean;
  addSubActivityLoading: boolean;
}

const initialState: PriceListsState = {
  records: [],
  pagination: null,
  selectedPriceList: null,
  loading: false,
  error: null,
  deleteSubActivityLoading: false,
  updateSubActivityLoading: false,
  addSubActivityLoading: false,
};

const priceListsSlice = createSlice({
  name: "priceLists",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPriceList: (state) => {
      state.selectedPriceList = null;
    },
    setSelectedPriceList: (state, action: PayloadAction<PriceList>) => {
      state.selectedPriceList = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Price Lists
    builder
      .addCase(actGetPriceLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actGetPriceLists.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(actGetPriceLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Price List By ID
    builder
      .addCase(actGetPriceListById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actGetPriceListById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPriceList = action.payload.data;
      })
      .addCase(actGetPriceListById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Price List
    builder
      .addCase(actAddPriceList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actAddPriceList.fulfilled,
        (
          state,
          action: PayloadAction<{ data: PriceList; message: string }>,
        ) => {
          state.loading = false;
          state.records.push(action.payload.data);
        },
      )
      .addCase(actAddPriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Price List
    builder
      .addCase(actUpdatePriceList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actUpdatePriceList.fulfilled,
        (
          state,
          action: PayloadAction<{ data: PriceList; message: string }>,
        ) => {
          state.loading = false;
          const index = state.records.findIndex(
            (priceList) => priceList._id === action.payload.data._id,
          );
          if (index !== -1) {
            state.records[index] = action.payload.data;
          }
          // Update selected price list if it's the same one
          if (state.selectedPriceList?._id === action.payload.data._id) {
            state.selectedPriceList = action.payload.data;
          }
        },
      )
      .addCase(actUpdatePriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Price List
    builder
      .addCase(actDeletePriceList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actDeletePriceList.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.records = state.records.filter(
            (priceList) => priceList._id !== action.payload,
          );
          // Clear selected price list if it's the deleted one
          if (state.selectedPriceList?._id === action.payload) {
            state.selectedPriceList = null;
          }
        },
      )
      .addCase(actDeletePriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Sub Activity from Price List
    builder
      .addCase(actDeleteSubActivityFromPriceList.pending, (state) => {
        state.deleteSubActivityLoading = true;
        state.error = null;
      })
      .addCase(
        actDeleteSubActivityFromPriceList.fulfilled,
        (
          state,
          action: PayloadAction<{ priceListId: string; subActivityId: string }>,
        ) => {
          state.deleteSubActivityLoading = false;
          // Update the selected price list by removing the deleted sub-activity
          if (state.selectedPriceList?._id === action.payload.priceListId) {
            state.selectedPriceList.subActivityPrices =
              state.selectedPriceList?.subActivityPrices?.filter(
                (item) => item._id !== action.payload.subActivityId,
              );
          }
          // Update the records as well
          const priceListIndex = state.records.findIndex(
            (priceList) => priceList._id === action.payload.priceListId,
          );
          if (priceListIndex !== -1) {
            state.records[priceListIndex].subActivityPrices = state.records[
              priceListIndex
            ]?.subActivityPrices?.filter(
              (item) => item._id !== action.payload.subActivityId,
            );
          }
        },
      )
      .addCase(actDeleteSubActivityFromPriceList.rejected, (state, action) => {
        state.deleteSubActivityLoading = false;
        state.error = action.payload as string;
      });

    // Update Sub Activity Price
    builder
      .addCase(actUpdateSubActivityPrice.pending, (state) => {
        state.updateSubActivityLoading = true;
        state.error = null;
      })
      .addCase(
        actUpdateSubActivityPrice.fulfilled,
        (
          state,
          action: PayloadAction<{ data: PriceList; message: string }>,
        ) => {
          state.updateSubActivityLoading = false;
          // Update the selected price list
          if (state.selectedPriceList?._id === action.payload.data._id) {
            state.selectedPriceList = action.payload.data;
          }
          // Update the records as well
          const priceListIndex = state.records.findIndex(
            (priceList) => priceList._id === action.payload.data._id,
          );
          if (priceListIndex !== -1) {
            state.records[priceListIndex] = action.payload.data;
          }
        },
      )
      .addCase(actUpdateSubActivityPrice.rejected, (state, action) => {
        state.updateSubActivityLoading = false;
        state.error = action.payload as string;
      });

    // Add Sub Activity to Price List
    builder
      .addCase(actAddPriceListSubActivity.pending, (state) => {
        state.addSubActivityLoading = true;
        state.error = null;
      })
      .addCase(
        actAddPriceListSubActivity.fulfilled,
        (
          state,
          action: PayloadAction<{ data?: PriceList; message?: string }>,
        ) => {
          state.addSubActivityLoading = false;
          if (action.payload.data) {
            // Update the selected price list
            if (state.selectedPriceList?._id === action.payload.data._id) {
              state.selectedPriceList = action.payload.data;
            }
            // Update the records as well
            const priceListIndex = state.records.findIndex(
              (priceList) => priceList._id === action.payload.data!._id,
            );
            if (priceListIndex !== -1) {
              state.records[priceListIndex] = action.payload.data;
            }
          }
        },
      )
      .addCase(actAddPriceListSubActivity.rejected, (state, action) => {
        state.addSubActivityLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedPriceList, setSelectedPriceList } =
  priceListsSlice.actions;
export default priceListsSlice.reducer;
