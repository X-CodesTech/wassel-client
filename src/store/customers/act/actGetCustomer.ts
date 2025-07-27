import customerServices from "@/services/customerServices";
import { axiosErrorHandler } from "@/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const actGetCustomer = createAsyncThunk(
  "customers/actGetCustomer",
  async (custAccount: string, { rejectWithValue }) => {
    try {
      const customer = await customerServices.getCustomerDetails(custAccount);
      const priceLists = await customerServices.getCustomerPriceList(
        customer.data.data._id
      );
      return {
        data: { ...customer.data.data, priceLists: priceLists.data.data },
      };
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);
