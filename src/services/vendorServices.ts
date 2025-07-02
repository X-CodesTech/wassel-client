import http from "./http";
import { apiUrlConstants } from "./apiUrlConstants";
import { Vendor, VendorFilters, VendorResponse } from "@/types/types";

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
};

export default vendorServices;
