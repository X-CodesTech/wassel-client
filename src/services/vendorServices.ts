import {
  SubActivity,
  Vendor,
  VendorFilters,
  VendorResponse,
} from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";
import { TPriceBody } from "@/types/vendorPriceListEditTypes";

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

export type PricingMethod = "perItem" | "perLocation" | "perTrip";

// Base interface for common properties
interface BaseSubActivityPriceRequest {
  subActivity: string;
  cost: number;
}

// Specific interfaces for each pricing method
export interface PerItemSubActivityPriceRequest
  extends BaseSubActivityPriceRequest {
  pricingMethod: "perItem";
}

export interface PerLocationSubActivityPriceRequest
  extends BaseSubActivityPriceRequest {
  pricingMethod: "perLocation";
  locationPrices: LocationPrice[];
}

export interface PerTripSubActivityPriceRequest
  extends BaseSubActivityPriceRequest {
  pricingMethod: "perTrip";
  locationPrices: LocationPrice[];
}

// Mapped type that creates the interface name based on pricing method
export type AddSubActivityPriceRequest<T extends PricingMethod> =
  T extends "perItem"
    ? PerItemSubActivityPriceRequest
    : T extends "perLocation"
    ? PerLocationSubActivityPriceRequest
    : T extends "perTrip"
    ? PerTripSubActivityPriceRequest
    : never;

// Helper type to get the interface name dynamically
export type AddPricingMethodSubActivityPriceRequest<T extends PricingMethod> =
  `Add${Capitalize<T>}SubActivityPriceRequest`;

// Legacy interfaces for backward compatibility (you can remove these if not needed)
export interface AddPerItemSubActivityPriceRequest
  extends PerItemSubActivityPriceRequest {}
export interface AddPerLocationSubActivityPriceRequest
  extends PerLocationSubActivityPriceRequest {}
export interface AddPerTripSubActivityPriceRequest
  extends PerTripSubActivityPriceRequest {}

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
  /**
   * Upload vendor price list from Excel
   * @param vendorId - Vendor ID to upload price list for
   * @param payload - FormData containing the Excel file and metadata
   * @returns Promise<any>
   */
  uploadVendorPriceListFromExcel: async (
    vendorId: string,
    payload: FormData
  ): Promise<any> => {
    const response = await http.post(
      `${apiUrlConstants.vendorPriceLists}/vendor/${vendorId}/upload`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  addSubActivityPrice: async <T extends PricingMethod>({
    vendorPriceListId,
    subActivity,
    pricingMethod,
    cost,
    ...rest
  }: AddSubActivityPriceRequest<T> & {
    vendorPriceListId: string;
  }): Promise<any> => {
    const response = await http.post(
      `${apiUrlConstants.vendorPriceLists}/${vendorPriceListId}/sub-activity`,
      {
        subActivity,
        pricingMethod,
        cost,
        ...rest,
      }
    );
    return response.data;
  },

  deleteSubActivityPrice: async (
    vendorPriceListId: string,
    subActivityPriceId: string
  ) => {
    return await http.delete(
      `${apiUrlConstants.vendorPriceLists}/${vendorPriceListId}/sub-activity/${subActivityPriceId}`
    );
  },

  editVendorSubActivityPrice: async <T extends PricingMethod>({
    pricingMethod,
    subActivityId,
    vendorPriceListId,
    ...rest
  }: TPriceBody<T>): Promise<any> => {
    return await http.put(
      `${apiUrlConstants.vendorPriceLists}/${vendorPriceListId}/sub-activity/${subActivityId}`,
      {
        pricingMethod,
        ...rest,
      }
    );
  },
};

export default vendorServices;
