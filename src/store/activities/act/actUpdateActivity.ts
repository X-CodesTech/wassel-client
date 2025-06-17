import { activitieServices } from "@/services";
import { Activity } from "@/types/types";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actUpdateActivity = createAsyncThunk(
  "activities/actUpdateActivity",
  async (activity: Activity, { rejectWithValue }) => {
    try {
      const { data } = await activitieServices.updateActivity(
        activity._id!,
        activity
      );
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
