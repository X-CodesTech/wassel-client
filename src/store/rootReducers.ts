import { combineReducers } from "@reduxjs/toolkit";
import auth from "./auth/authSlice";
import activities from "./activities/activitiesSlice";
import transactionTypes from "./transactionTypes/transactionTypesSlice";

export const rootReducer = combineReducers({
  auth,
  activities,
  transactionTypes,
});
