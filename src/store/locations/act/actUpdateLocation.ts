import locationServices from "@/services/locationServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { InsertLocation } from "@/types/types";

interface UpdateLocationPayload {
  id: string;
  location: InsertLocation;
}

export const actUpdateLocation = createAsyncThunk(
  "locations/actUpdateLocation",
  async ({ id, location }: UpdateLocationPayload, { rejectWithValue }) => {
    try {
      const { data } = await locationServices.updateLocation(id, location);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
