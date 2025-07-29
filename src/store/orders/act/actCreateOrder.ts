import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderServices } from "@/services";
import {
  CreateOrderStep1Request,
  CreateOrderStep2Request,
  CreateOrderStep3Request,
} from "@/types/types";
import {
  setLoading,
  setError,
  setSuccess,
  setStep1Data,
  setStep2Data,
  setStep3Data,
  setOrderDetails,
  setOrdersListLoading,
  setOrdersListError,
  setOrdersList,
  setOrdersPagination,
  setIpoSubmissionLoading,
} from "../ordersSlice";

// Step 1: Create basic order
export const actCreateBasicOrder = createAsyncThunk(
  "orders/createBasicOrder",
  async (data: CreateOrderStep1Request, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await orderServices.createBasicOrder(data);

      if (response.success) {
        dispatch(setStep1Data(response.data));
        dispatch(setSuccess(true));
        return response;
      } else {
        throw new Error(response.message || "Failed to create basic order");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Step 2: Add pickup and delivery information
export const actAddPickupDeliveryInfo = createAsyncThunk(
  "orders/addPickupDeliveryInfo",
  async (
    { orderId, data }: { orderId: string; data: CreateOrderStep2Request },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await orderServices.addPickupDeliveryInfo(orderId, data);

      if (response.success) {
        dispatch(setStep2Data(response.data));
        dispatch(setSuccess(true));
        return response;
      } else {
        throw new Error(
          response.message || "Failed to add pickup and delivery info"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Step 3: Add shipping details
export const actAddShippingDetails = createAsyncThunk(
  "orders/addShippingDetails",
  async (
    { orderId, data }: { orderId: string; data: CreateOrderStep3Request },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await orderServices.addShippingDetails(orderId, data);

      if (response.success) {
        dispatch(setStep3Data(response.data));
        dispatch(setSuccess(true));
        return response;
      } else {
        throw new Error(response.message || "Failed to add shipping details");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get order by ID
export const actGetOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (orderId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await orderServices.getOrderById(orderId);

      if (response.success) {
        dispatch(setOrderDetails(response.data));
        dispatch(setSuccess(true));
        return response;
      } else {
        throw new Error(response.message || "Failed to get order");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Calculate order price
export const actCalculateOrderPrice = createAsyncThunk(
  "orders/calculateOrderPrice",
  async ({ orderId, data }: { orderId: string; data?: any }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await orderServices.calculateOrderPrice(
        orderId,
        data || {}
      );

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Failed to calculate order price");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get order price breakdown
export const actGetOrderPriceBreakdown = createAsyncThunk(
  "orders/getOrderPriceBreakdown",
  async (orderId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await orderServices.getOrderPriceBreakdown(orderId);

      if (response.success) {
        return response;
      } else {
        throw new Error(
          response.message || "Failed to get order price breakdown"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get all orders
export const actGetOrders = createAsyncThunk(
  "orders/getOrders",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } = {},
    { dispatch }
  ) => {
    try {
      dispatch(setOrdersListLoading(true));
      dispatch(setOrdersListError(null));

      const response = await orderServices.getOrders(params);

      console.log("Raw API Response:", response);

      if (response.success) {
        // Handle different possible response structures
        let orders = [];
        let total = 0;

        if (Array.isArray(response.data)) {
          // Data is directly an array of orders
          orders = response.data;
          total = response.total || response.data.length;
        } else if (response.data && Array.isArray(response.data.orders)) {
          // Data contains orders array and pagination info
          orders = response.data.orders;
          total = response.data.total || response.data.orders.length;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Data contains nested data array
          orders = response.data.data;
          total = response.data.total || response.data.data.length;
        } else {
          // Fallback
          orders = [];
          total = 0;
        }

        console.log("Extracted orders:", orders);
        console.log("Total count:", total);

        dispatch(setOrdersList(orders));
        dispatch(
          setOrdersPagination({
            total: total,
            page: params.page || 1,
          })
        );
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setOrdersListError(errorMessage));
      throw error;
    } finally {
      dispatch(setOrdersListLoading(false));
    }
  }
);

// Submit IPO
export const actSubmitIPO = createAsyncThunk(
  "orders/submitIPO",
  async (
    { orderId, data }: { orderId: string; data: any },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setIpoSubmissionLoading(true));
      dispatch(setError(null));

      const response = await orderServices.submitIPO(orderId, data);

      if (response.success) {
        dispatch(setSuccess(true));
        return response;
      } else {
        throw new Error(response.message || "Failed to submit IPO");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setIpoSubmissionLoading(false));
    }
  }
);
