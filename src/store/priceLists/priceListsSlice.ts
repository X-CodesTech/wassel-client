import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PriceList } from "@/services/priceListServices";
import {
  actGetPriceLists,
  actAddPriceList,
  actUpdatePriceList,
  actDeletePriceList,
} from "./act";

interface PriceListsState {
  records: PriceList[];
  loading: boolean;
  error: string | null;
}

const initialState: PriceListsState = {
  records: [],
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
        }
      )
      .addCase(actDeletePriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = priceListsSlice.actions;
export default priceListsSlice.reducer;
