import { useAppDispatch, useAppSelector } from "./useAppSelector";
import { useCallback } from "react";
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

  const createBasicOrder = useCallback(
    async (data: CreateOrderStep1Request) => {
      try {
        const result = await dispatch(actCreateBasicOrder(data)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const addPickupDeliveryInfo = useCallback(
    async (orderId: string, data: CreateOrderStep2Request) => {
      try {
        const result = await dispatch(
          actAddPickupDeliveryInfo({ orderId, data })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const addShippingDetails = useCallback(
    async (orderId: string, data: CreateOrderStep3Request) => {
      try {
        const result = await dispatch(
          actAddShippingDetails({ orderId, data })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const getOrderById = useCallback(
    async (orderId: string) => {
      try {
        const result = await dispatch(actGetOrderById(orderId)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const calculateOrderPrice = useCallback(
    async (orderId: string, data?: any) => {
      try {
        const result = await dispatch(
          actCalculateOrderPrice({ orderId, data })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const getOrderPriceBreakdown = useCallback(
    async (orderId: string) => {
      try {
        const result = await dispatch(
          actGetOrderPriceBreakdown(orderId)
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const clearOrderData = useCallback(() => {
    dispatch(clearOrder());
  }, [dispatch]);

  const clearOrderError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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
