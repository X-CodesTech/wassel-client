import { activitieServices } from "@/services";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actRemoveActivity = createAsyncThunk(
  "activities/actRemoveActivity",
  async (id: string, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await activitieServices.deleteActivity(id);
      if (response.status === 204) {
        return response.data;
      } else {
        throw response;
      }
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
