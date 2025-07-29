import http from "./http";
import { apiUrlConstants } from "./apiUrlConstants";
import {
  CustomerFilters,
  CustomerResponse,
  CustomerImportResponse,
} from "@/types/types";
import { AxiosResponse } from "axios";
import { TPriceMethod } from "@/types/vendorPriceListEditTypes";
import {
  TCustomerPriceListBody,
  TPricingMethod,
} from "@/types/customerPriceList.type";

export type CustomerPriceListResponse = {
  _id: string;
  customer: Customer;
  priceList: PriceList;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export type Customer = {
  _id: string;
  custAccount: string;
  custName: string;
};

export type PriceList = {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom: Date;
  effectiveTo: Date;
  subActivityPrices: SubActivityPrice[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export type SubActivityPrice = {
  subActivity: SubActivity;
  basePrice?: number;
  pricingMethod: TPriceMethod;
  _id: string;
  locationPrices: LocationPrice[];
};

export type LocationPrice = {
  location?: Location;
  price: number;
  pricingMethod: TPriceMethod;
  _id: string;
  fromLocation?: Location;
  toLocation?: Location;
};

export type Location = {
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
};

export type SubActivity = {
  _id: string;
  transactionType: TransactionType;
  activity: Activity;
  financeEffect: string;
  pricingMethod: TPriceMethod;
  portalItemNameEn: string;
  portalItemNameAr: string;
  isUsedByFinance: boolean;
  isUsedByOps: boolean;
  isInShippingUnit: boolean;
  isActive: boolean;
  isInSpecialRequirement: boolean;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
  id: string;
};

export type Activity = {
  _id: string;
  actSrl: string;
  activityTransactionType: string;
  activityNameEn: string;
  activityNameAr: string;
  activityCode: string;
  portalActivityNameEn: string;
  portalActivityNameAr: string;
  isWithItems: boolean;
  isOpsActive: boolean;
  isPortalActive: boolean;
  isInOrderScreen: boolean;
  isInShippingUnit: boolean;
  isActive: boolean;
  isInSpecialRequirement: boolean;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
  id: string;
};

export type TransactionType = {
  _id: string;
  name: string;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
};
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

  /**
   * Get customer price list
   */
  getCustomerPriceList: async (
    customerId: string
  ): Promise<AxiosResponse<{ data: CustomerPriceListResponse[] }>> => {
    return await http.get(
      `${apiUrlConstants.customerPriceLists}/customer/${customerId}`
    );
  },

  /**
   * Export customer price list to excel
   */
  exportCustomerPriceList: async ({
    customerId,
    isActive = true,
  }: {
    customerId: string;
    isActive?: boolean;
  }): Promise<AxiosResponse<Blob>> => {
    return await http.get(
      `${apiUrlConstants.customerPriceLists}/customer/${customerId}/export`,
      {
        responseType: "blob",
        params: {
          isActive,
        },
      }
    );
  },

  /**
   * Upload customer price list from excel
   * requires socket connection to retrieve the progress of the upload
   */
  uploadCustomerPriceList: async (
    customerId: string,
    payload: FormData
  ): Promise<AxiosResponse<{ data: CustomerPriceListResponse }>> => {
    return await http.post(
      `${apiUrlConstants.customerPriceLists}/customer/${customerId}/upload`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  /**
   * Delete customer price list
   */
  deleteCustomerPriceList: async (
    priceListId: string
  ): Promise<AxiosResponse<{ message: string }>> => {
    return await http.delete(
      `${apiUrlConstants.customerPriceLists}/${priceListId}`
    );
  },

  /**
   * Add customer price list
   */
  createCustomerPriceList: async ({
    customerId,
    priceListData,
  }: {
    customerId: string;
    priceListData: Partial<PriceList>;
  }): Promise<
    AxiosResponse<{
      message: string;
      data: {
        _id: string;
        name: string;
        nameAr: string;
        description: string;
        descriptionAr: string;
        effectiveFrom: Date;
        effectiveTo: Date;
        subActivityPrices: [];
      };
      customerPriceLust: {
        customerId: string;
        priceListId: string;
        message: string;
      };
    }>
  > => {
    return await http.post(apiUrlConstants.priceLists, {
      ...priceListData,
      customerId,
    });
  },

  /**
   * Add customer price list sub activity
   */
  addCustomerPriceListSubActivity: async <T extends TPricingMethod>({
    priceListId,
    pricingMethod,
    subActivityId,
    ...rest
  }: TCustomerPriceListBody<T> & {
    priceListId: string;
  }): Promise<AxiosResponse<{ data: CustomerPriceListResponse }>> => {
    return await http.post(
      `${apiUrlConstants.customerPriceLists}/${priceListId}/sub-activity`,
      {
        pricingMethod,
        subActivity: subActivityId,
        ...rest,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },

  /**
   * Delete customer price list sub activity
   */
  deleteCustomerPriceListSubActivity: async ({
    customerId,
    subActivityId,
  }: {
    customerId: string;
    subActivityId: string;
  }): Promise<AxiosResponse<{ message: string }>> => {
    return await http.delete(
      `${apiUrlConstants.customerPriceLists}/${customerId}/sub-activity/${subActivityId}`
    );
  },

  /**
   * Import customer price list from excel
   */
  importCustomerPriceList: async ({
    customerId,
    formData,
  }: {
    customerId: string;
    formData: FormData;
  }): Promise<AxiosResponse<{ data: CustomerPriceListResponse }>> => {
    return await http.post(
      `${apiUrlConstants.customerPriceLists}/customer/${customerId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};

export default customerServices;
