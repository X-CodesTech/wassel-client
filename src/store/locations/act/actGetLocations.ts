import locationServices from "@/services/locationServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { LocationFilters } from "@/types/types";

export const actGetLocations = createAsyncThunk(
  "locations/actGetLocations",
  async (filters?: LocationFilters, { rejectWithValue }) => {
    try {
      const { data } = await locationServices.getLocations(filters);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
