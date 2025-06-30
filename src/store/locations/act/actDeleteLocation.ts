import locationServices from "@/services/locationServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actDeleteLocation = createAsyncThunk(
  "locations/actDeleteLocation",
  async (id: string, { rejectWithValue }) => {
    try {
      await locationServices.deleteLocation(id);
      return id;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
