import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PriceList } from "@/services/priceListServices";
import {
  actGetPriceLists,
  actAddPriceList,
  actUpdatePriceList,
  actDeletePriceList,
  actGetPriceListById,
} from "./act";

interface PriceListsState {
  records: PriceList[];
  selectedPriceList: PriceList | null;
  loading: boolean;
  error: string | null;
}

const initialState: PriceListsState = {
  records: [],
  selectedPriceList: null,
  loading: false,
  error: null,
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
        (state, action: PayloadAction<PriceList>) => {
          state.loading = false;
          state.records.push(action.payload);
        }
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
        (state, action: PayloadAction<PriceList>) => {
          state.loading = false;
          const index = state.records.findIndex(
            (priceList) => priceList._id === action.payload._id
          );
          if (index !== -1) {
            state.records[index] = action.payload;
          }
          // Update selected price list if it's the same one
          if (state.selectedPriceList?._id === action.payload._id) {
            state.selectedPriceList = action.payload;
          }
        }
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
            (priceList) => priceList._id !== action.payload
          );
          // Clear selected price list if it's the deleted one
          if (state.selectedPriceList?._id === action.payload) {
            state.selectedPriceList = null;
          }
        }
      )
      .addCase(actDeletePriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedPriceList } = priceListsSlice.actions;
export default priceListsSlice.reducer;
