import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CreateOrderStep1Response,
  CreateOrderStep2Response,
  CreateOrderStep3Response,
  GetOrderResponse,
} from "@/types/types";

interface OrderState {
  currentOrder: {
    step1?: CreateOrderStep1Response["data"];
    step2?: CreateOrderStep2Response["data"];
    step3?: CreateOrderStep3Response["data"];
    orderDetails?: GetOrderResponse["data"];
  };
  loading: boolean;
  error: string | null;
  success: boolean;
  orderId: string | null;
}

const initialState: OrderState = {
  currentOrder: {},
  loading: false,
  error: null,
  success: false,
  orderId: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
      state.loading = false;
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },
    setStep1Data: (
      state,
      action: PayloadAction<CreateOrderStep1Response["data"]>
    ) => {
      state.currentOrder.step1 = action.payload;
      state.orderId = action.payload._id;
    },
    setStep2Data: (
      state,
      action: PayloadAction<CreateOrderStep2Response["data"]>
    ) => {
      state.currentOrder.step2 = action.payload;
    },
    setStep3Data: (
      state,
      action: PayloadAction<CreateOrderStep3Response["data"]>
    ) => {
      state.currentOrder.step3 = action.payload;
    },
    setOrderDetails: (
      state,
      action: PayloadAction<GetOrderResponse["data"]>
    ) => {
      state.currentOrder.orderDetails = action.payload;
    },
    clearOrder: (state) => {
      state.currentOrder = {};
      state.orderId = null;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccess,
  setOrderId,
  setStep1Data,
  setStep2Data,
  setStep3Data,
  setOrderDetails,
  clearOrder,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
