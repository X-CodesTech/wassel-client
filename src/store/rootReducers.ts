import { combineReducers } from "@reduxjs/toolkit";
import auth from "./auth/authSlice";

export const rootReducer = combineReducers({
  auth,
});
