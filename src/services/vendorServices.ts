import http from "./http";
import { apiUrlConstants } from "./apiUrlConstants";
import { VendorFilters, VendorResponse } from "@/types/types";

export interface VendorSyncResponse {
  message: string;
  stats: {
    total: number;
    inserted: number;
    updated: number;
    unchanged: number;
    failed: number;
  };
}

export interface VendorPriceListResponse {
  message: string;
  priceList: VendorPriceList[];
}

export interface VendorPriceList {
  _id: string;
  vendorId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  subActivityPrices: SubActivityPrice[];
  createdAt?: string;
  updatedAt?: string;
}

// New interfaces for vendor price list creation
export interface LocationPrice {
  location: string;
  fromLocation: string;
  toLocation: string;
  cost: number;
  pricingMethod: "perLocation" | "perItem" | "perTrip";
}

export interface SubActivityPrice {
  subActivity: string;
  pricingMethod: "perLocation" | "perItem" | "perTrip";
  cost: number;
  locationPrices: LocationPrice[];
}

export interface CreateVendorPriceListRequest {
  vendorId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  subActivityPrices: SubActivityPrice[];
}

export interface UpdateVendorPriceListRequest
  extends CreateVendorPriceListRequest {
  _id: string;
}

export interface DeleteVendorPriceListResponse {
  message: string;
  deletedPriceList: VendorPriceList;
}

const vendorServices = {
  /**
   * Get vendors with pagination, search, and sorting
   */
  getVendors: async (filters: VendorFilters = {}): Promise<VendorResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `${apiUrlConstants.vendors}?${queryString}`
      : apiUrlConstants.vendors;

    const response = await http.get(url);
    return response.data;
  },

  /**
   * Sync vendors from remote API
   */
  syncVendors: async (): Promise<VendorSyncResponse> => {
    const response = await http.get(`${apiUrlConstants.vendors}/sync`);
    return response.data;
  },

  /**
   * Create vendor price list
   */
  createVendorPriceList: async (
    data: CreateVendorPriceListRequest
  ): Promise<VendorPriceListResponse> => {
    const response = await http.post(
      `${apiUrlConstants.vendorPriceLists}`,
      data
    );
    return response.data;
  },

  /**
   * Update vendor price list
   */
  updateVendorPriceList: async (
    data: UpdateVendorPriceListRequest
  ): Promise<VendorPriceListResponse> => {
    const response = await http.put(
      `${apiUrlConstants.vendorPriceLists}/${data._id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete vendor price list
   */
  deleteVendorPriceList: async (
    id: string
  ): Promise<DeleteVendorPriceListResponse> => {
    const response = await http.delete(
      `${apiUrlConstants.vendorPriceLists}/${id}`
    );
    return response.data;
  },

  getVendorPriceLists: async (
    vendorId: string
  ): Promise<VendorPriceListResponse> => {
    const response = await http.get(
      `${apiUrlConstants.vendorPriceLists}/vendor/${vendorId}`
    );
    return response.data;
  },
};

export default vendorServices;
