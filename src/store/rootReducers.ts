import { combineReducers } from "@reduxjs/toolkit";
import auth from "./auth/authSlice";
import activities from "./activities/activitiesSlice";
import transactionTypes from "./transactionTypes/transactionTypesSlice";
import locations from "./locations/locationsSlice";
import priceLists from "./priceLists/priceListsSlice";

export const rootReducer = combineReducers({
  auth,
  activities,
  transactionTypes,
  locations,
  priceLists,
});
