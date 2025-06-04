import { combineReducers } from "@reduxjs/toolkit";
import auth from "./auth/authSlice";
import activities from "./activities/activitiesSlice";

export const rootReducer = combineReducers({
  auth,
  activities,
});
