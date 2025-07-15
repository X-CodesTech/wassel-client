import http from "./http";
import { apiUrlConstants } from "./apiUrlConstants";
import {
  CreateOrderStep1Request,
  CreateOrderStep1Response,
  CreateOrderStep2Request,
  CreateOrderStep2Response,
  CreateOrderStep3Request,
  CreateOrderStep3Response,
  GetOrderResponse,
  AddItemRequest,
  AddItemResponse,
  DeleteItemRequest,
  DeleteItemResponse,
  CalculatePriceRequest,
  CalculatePriceResponse,
  GetPriceBreakdownResponse,
} from "@/types/types";

const orderServices = {
  /**
   * Step 1: Create basic order
   */
  createBasicOrder: async (
    data: CreateOrderStep1Request
  ): Promise<CreateOrderStep1Response> => {
    const response = await http.post(apiUrlConstants.orders, data);
    return response.data;
  },

  /**
   * Step 2: Add pickup and delivery information
   */
  addPickupDeliveryInfo: async (
    orderId: string,
    data: CreateOrderStep2Request
  ): Promise<CreateOrderStep2Response> => {
    const response = await http.put(
      `${apiUrlConstants.orders}/${orderId}/pickup-delivery`,
      data
    );
    return response.data;
  },

  /**
   * Step 3: Add shipping details
   */
  addShippingDetails: async (
    orderId: string,
    data: CreateOrderStep3Request
  ): Promise<CreateOrderStep3Response> => {
    const response = await http.put(
      `${apiUrlConstants.orders}/${orderId}/shipping`,
      data
    );
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<GetOrderResponse> => {
    const response = await http.get(`${apiUrlConstants.orders}/${orderId}`);
    return response.data;
  },

  /**
   * Add item to order
   */
  addItemToOrder: async (
    orderId: string,
    data: AddItemRequest
  ): Promise<AddItemResponse> => {
    const response = await http.put(
      `${apiUrlConstants.orders}/${orderId}/add-item`,
      data
    );
    return response.data;
  },

  /**
   * Delete item from order
   */
  deleteItemFromOrder: async (
    orderId: string,
    data: DeleteItemRequest
  ): Promise<DeleteItemResponse> => {
    const response = await http.delete(
      `${apiUrlConstants.orders}/${orderId}/delete-item`,
      { data }
    );
    return response.data;
  },

  /**
   * Calculate order pricing
   */
  calculateOrderPrice: async (
    orderId: string,
    data: CalculatePriceRequest
  ): Promise<CalculatePriceResponse> => {
    const response = await http.post(
      `${apiUrlConstants.orders}/${orderId}/calculate-price`,
      data
    );
    return response.data;
  },

  /**
   * Get order price breakdown
   */
  getOrderPriceBreakdown: async (
    orderId: string
  ): Promise<GetPriceBreakdownResponse> => {
    const response = await http.get(
      `${apiUrlConstants.orders}/${orderId}/price-breakdown`
    );
    return response.data;
  },
};

export default orderServices;
