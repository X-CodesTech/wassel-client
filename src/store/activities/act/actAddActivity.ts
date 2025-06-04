import { activitieServices } from "@/services";
import { Activity } from "@/types/types";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actAddActivity = createAsyncThunk(
  "activities/actAddActivity",
  async (params: Activity, { rejectWithValue }) => {
    try {
      const { data } = await activitieServices.addActivity(params);
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
