import { isString, TLoading } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { actGetActivities } from "./act/actGetActivities";
import { actAddActivity } from "./act/actAddActivity";
import { Activity } from "@/types/types";
import { actUpdateActivity } from "./act/actUpdateActivity";

interface IActivitiesState {
  records: Activity[];
  loading: TLoading;
  error: null | string;
}

const initialState: IActivitiesState = {
  records: [],
  loading: "idle",
  error: null,
};

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(actGetActivities.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actGetActivities.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = action.payload;
    });
    builder.addCase(actGetActivities.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
    builder.addCase(actAddActivity.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actAddActivity.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = [...state.records, action.payload];
    });
    builder.addCase(actAddActivity.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
    builder.addCase(actUpdateActivity.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actUpdateActivity.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      const updatedActivity = action.payload;
      state.records = state.records.map((activity) =>
        activity._id === updatedActivity._id ? updatedActivity : activity
      );
    });
    builder.addCase(actUpdateActivity.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
  },
});

export const {} = activitiesSlice.actions;

export { actGetActivities, actAddActivity };

export default activitiesSlice.reducer;
