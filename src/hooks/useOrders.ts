import { useAppDispatch, useAppSelector } from "./useAppSelector";
import {
  actCreateBasicOrder,
  actAddPickupDeliveryInfo,
  actAddShippingDetails,
  actGetOrderById,
  actCalculateOrderPrice,
  actGetOrderPriceBreakdown,
  clearOrder,
  clearError,
} from "@/store/orders";
import {
  CreateOrderStep1Request,
  CreateOrderStep2Request,
  CreateOrderStep3Request,
} from "@/types/types";

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const { currentOrder, loading, error, success, orderId } = useAppSelector(
    (state) => state.orders
  );

  const createBasicOrder = async (data: CreateOrderStep1Request) => {
    try {
      const result = await dispatch(actCreateBasicOrder(data)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addPickupDeliveryInfo = async (
    orderId: string,
    data: CreateOrderStep2Request
  ) => {
    try {
      const result = await dispatch(
        actAddPickupDeliveryInfo({ orderId, data })
      ).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addShippingDetails = async (
    orderId: string,
    data: CreateOrderStep3Request
  ) => {
    try {
      const result = await dispatch(
        actAddShippingDetails({ orderId, data })
      ).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const getOrderById = async (orderId: string) => {
    try {
      const result = await dispatch(actGetOrderById(orderId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const calculateOrderPrice = async (orderId: string, data?: any) => {
    try {
      const result = await dispatch(
        actCalculateOrderPrice({ orderId, data })
      ).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const getOrderPriceBreakdown = async (orderId: string) => {
    try {
      const result = await dispatch(
        actGetOrderPriceBreakdown(orderId)
      ).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const clearOrderData = () => {
    dispatch(clearOrder());
  };

  const clearOrderError = () => {
    dispatch(clearError());
  };

  return {
    // State
    currentOrder,
    loading,
    error,
    success,
    orderId,

    // Actions
    createBasicOrder,
    addPickupDeliveryInfo,
    addShippingDetails,
    getOrderById,
    calculateOrderPrice,
    getOrderPriceBreakdown,
    clearOrderData,
    clearOrderError,
  };
};
