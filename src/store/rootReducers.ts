import { combineReducers } from "@reduxjs/toolkit";
import auth from "./auth/authSlice";
import activities from "./activities/activitiesSlice";
import transactionTypes from "./transactionTypes/transactionTypesSlice";
import locations from "./locations/locationsSlice";
import customers from "./customers/customersSlice";
import priceLists from "./priceLists/priceListsSlice";
import vendors from "./vendors/vendorsSlice";

export const rootReducer = combineReducers({
  auth,
  activities,
  transactionTypes,
  locations,
  customers,
  priceLists,
  vendors,
});
