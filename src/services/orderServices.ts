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

export interface SubmitIPORequest {
  orderBasicInfo: {
    orderId: string;
    orderIndex: string;
    customer: string;
    orderDate: string;
    service: string;
    typesOfGoods: string;
    goodsDescription: string;
  };
  financialSummary: {
    totalPrice: number;
    totalCost: number;
    profitMargin: number;
    profitAmount: number;
    currency: string;
  };
  truckTypeMatches: Array<{
    index: number;
    subActivityId: string;
    subActivityName: string;
    priceListName: string;
    pricingMethod: string;
    price: number;
    cost: number;
    selectedVendor: string | null;
    locationDetails: any;
  }>;
  pickupSpecialRequirements: Array<{
    index: number;
    subActivityId: string;
    subActivityName: string;
    priceListName: string;
    pricingMethod: string;
    price: number;
    cost: number;
    selectedVendor: string | null;
  }>;
  deliverySpecialRequirements: Array<{
    index: number;
    subActivityId: string;
    subActivityName: string;
    priceListName: string;
    pricingMethod: string;
    price: number;
    cost: number;
    selectedVendor: string | null;
  }>;
  locationDetails: {
    shippingDetails: any;
  };
  attachments: Array<{
    index: number;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;
  overridesAndSelections: {
    priceOverrides: Record<string, number>;
    costOverrides: Record<string, number>;
    selectedVendors: Record<string, string>;
    selectedCosts: Record<string, number>;
  };
  ipoActions: any;
  metadata: {
    submissionTimestamp: string;
    totalServices: number;
    hasOverrides: boolean;
    hasVendorSelections: boolean;
  };
}

export interface SubmitIPOResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    orderIndex: string;
    status: string;
    submittedAt: string;
  };
}

export interface UpdateVendorRequest {
  subActivityId: string;
  vendorId: string;
  locationId?: string;
  fromLocationId?: string;
  toLocationId?: string;
}

export interface UpdateVendorResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderIndex: string;
    subActivityId: string;
    previousVendor: string;
    newVendor: {
      id: string;
      name: string;
    };
    costDetails: {
      method: string;
      cost: number;
    };
  };
}

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

  /**
   * Get all orders
   */
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await http.get(apiUrlConstants.orders, { params });
    return response.data;
  },

  /**
   * Update basic order information (for edit mode)
   */
  updateBasicOrder: async (
    orderId: string,
    data: CreateOrderStep1Request
  ): Promise<CreateOrderStep1Response> => {
    const response = await http.put(
      `${apiUrlConstants.orders}/${orderId}`,
      data
    );
    return response.data;
  },

  updateVendor: async (
    orderId: string,
    data: UpdateVendorRequest
  ): Promise<UpdateVendorResponse> => {
    const response = await http.put(
      `/api/v1/orders/${orderId}/update-vendor`,
      data
    );
    return response.data;
  },

  submitIPO: async (
    orderId: string,
    data: SubmitIPORequest
  ): Promise<SubmitIPOResponse> => {
    const response = await http.put(`/api/v1/orders/${orderId}/submit`, data);
    return response.data;
  },

  /**
   * Delete an order
   */
  deleteOrder: async (orderId: string) => {
    const response = await http.delete(`${apiUrlConstants.orders}/${orderId}`);
    return response.data;
  },
};

export default orderServices;
