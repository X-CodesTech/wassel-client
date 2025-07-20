import {
  SubActivity,
  Vendor,
  VendorFilters,
  VendorResponse,
} from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

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
  data: VendorPriceList[];
}

export interface VendorPriceList {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  vendor: Vendor;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date;
  subActivityPrices: SubActivityPrice[];
  __v: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  _id: string;
  country: string;
  countryAr: string;
  area: string;
  areaAr: string;
  city: string;
  cityAr: string;
  village: string;
  villageAr: string;
  isActive: boolean;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
}

// New interfaces for vendor price list creation
export interface LocationPrice {
  location?: Location;
  cost: number;
  pricingMethod: PricingMethod;
  _id: string;
  fromLocation?: Location;
  toLocation?: Location;
}

export type PricingMethod = "perLocation" | "perTrip" | "perItem";

export interface SubActivityPrice {
  subActivity: SubActivity;
  locationPrices: LocationPrice[];
  pricingMethod: PricingMethod;
  _id: string;
  cost?: number;
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

  exportVendorPriceListAsExcel: async ({
    id,
    isActive,
  }: {
    id: string;
    isActive: boolean;
  }) => {
    return await http.get(
      `${apiUrlConstants.vendorPriceLists}/vendor/${id}/export`,
      {
        responseType: "blob",
        params: {
          isActive,
        },
      }
    );
  },
};

export default vendorServices;
