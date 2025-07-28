import http from "./http";

export interface VendorCostData {
  vendor: string;
  vendorName: string;
  vendAccount: string;
  priceListId: string;
  priceListName: string;
  cost: number;
}

export interface VendorCostRange {
  min: number;
  max: number;
  average: number;
  count: number;
  totalVendors: number;
}

export interface VendorCostResponse {
  data: VendorCostData[];
  costRange: VendorCostRange;
}

export interface VendorCostParams {
  subActivityId: string;
  location?: string;
  fromLocation?: string;
  toLocation?: string;
}

export const vendorCostServices = {
  getSubActivityCost: async (
    params: VendorCostParams
  ): Promise<VendorCostResponse> => {
    const queryParams = new URLSearchParams();

    queryParams.append("subActivityId", params.subActivityId);
    if (params.location) queryParams.append("location", params.location);
    if (params.fromLocation)
      queryParams.append("fromLocation", params.fromLocation);
    if (params.toLocation) queryParams.append("toLocation", params.toLocation);

    const response = await http.get(
      `/api/v1/vendor-price-lists/sub-activity-cost?${queryParams.toString()}`
    );
    return response.data;
  },
};
