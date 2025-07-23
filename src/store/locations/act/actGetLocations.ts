import locationServices from "@/services/locationServices";
import { LocationFilters } from "@/types/types";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetLocations = createAsyncThunk(
  "locations/actGetLocations",
  async (
    {
      filters,
      page = 1,
      limit = 10,
    }: {
      filters: LocationFilters;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await locationServices.getLocations(
        page,
        limit,
        filters
      );
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
