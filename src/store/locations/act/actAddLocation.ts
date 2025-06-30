import locationServices from "@/services/locationServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { InsertLocation } from "@/types/types";

export const actAddLocation = createAsyncThunk(
  "locations/actAddLocation",
  async (location: InsertLocation, { rejectWithValue }) => {
    try {
      const { data } = await locationServices.addLocation(location);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
