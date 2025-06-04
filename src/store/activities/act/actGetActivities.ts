import activitieServices from "@/services/activitieServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetActivities = createAsyncThunk(
  "activities/actGetActivities",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await activitieServices.getActivities();
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
