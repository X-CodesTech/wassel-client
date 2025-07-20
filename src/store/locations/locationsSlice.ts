import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Location, LocationsResponse } from "@/types/types";
import {
  actGetLocations,
  actAddLocation,
  actUpdateLocation,
  actDeleteLocation,
} from "./act";

interface LocationsState {
  records: Location[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationsState = {
  records: [],
  loading: false,
  error: null,
};

const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Locations
    builder
      .addCase(actGetLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actGetLocations.fulfilled,
        (state, action: PayloadAction<LocationsResponse>) => {
          state.loading = false;
          state.records = action.payload.locations;
        }
      )
      .addCase(actGetLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Location
    builder
      .addCase(actAddLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actAddLocation.fulfilled,
        (state, action: PayloadAction<Location>) => {
          state.loading = false;
          state.records.push(action.payload);
        }
      )
      .addCase(actAddLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Location
    builder
      .addCase(actUpdateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actUpdateLocation.fulfilled,
        (state, action: PayloadAction<Location>) => {
          state.loading = false;
          const index = state.records.findIndex(
            (location) => location._id === action.payload._id
          );
          if (index !== -1) {
            state.records[index] = action.payload;
          }
        }
      )
      .addCase(actUpdateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Location
    builder
      .addCase(actDeleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        actDeleteLocation.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.records = state.records.filter(
            (location) => location._id !== action.payload
          );
        }
      )
      .addCase(actDeleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
