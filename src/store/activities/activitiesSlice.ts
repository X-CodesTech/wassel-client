import { isString, TLoading } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { actGetActivities } from "./act/actGetActivities";
import { actAddActivity } from "./act/actAddActivity";
import { Activity } from "@/types/types";

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
  },
});

export const {} = activitiesSlice.actions;

export { actGetActivities, actAddActivity };

export default activitiesSlice.reducer;
