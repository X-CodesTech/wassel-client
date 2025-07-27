import http from "./http";
import { apiUrlConstants } from "./apiUrlConstants";
import {
  Customer,
  CustomerFilters,
  CustomerResponse,
  CustomerImportResponse,
} from "@/types/types";
import { AxiosResponse } from "axios";

const customerServices = {
  /**
   * Get customers with pagination, search, and sorting
   */
  getCustomers: async (
    filters: CustomerFilters = {}
  ): Promise<CustomerResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `${apiUrlConstants.customers}?${queryString}`
      : apiUrlConstants.customers;

    const response = await http.get(url);
    return response.data;
  },

  /**
   * Import customers from third party provider
   */
  importCustomers: async (): Promise<CustomerImportResponse> => {
    const response = await http.get(`${apiUrlConstants.customers}/import`);
    return response.data;
  },

  /**
   * Get customer details
   */
  getCustomerDetails: async (
    custAccount: string
  ): Promise<AxiosResponse<{ data: Customer }>> => {
    return await http.get(`${apiUrlConstants.customers}/${custAccount}`);
  },
};

export default customerServices;
