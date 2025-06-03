import { isString, TLoading } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { actAuthLogin } from "./act/actAuthLogin";

interface IAuthState {
  records: any;
  loading: TLoading;
  error: null | string;
}

const initialState: IAuthState = {
  records: null,
  loading: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(actAuthLogin.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(actAuthLogin.fulfilled, (state, action) => {
      state.loading = "fulfilled";
      state.records = action.payload;
    });
    builder.addCase(actAuthLogin.rejected, (state, action) => {
      state.loading = "rejected";
      if (isString(action.payload)) {
        state.error = action.payload;
      }
    });
  },
});

export const {} = authSlice.actions;

export { actAuthLogin };

export default authSlice.reducer;
