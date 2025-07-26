import { SubActivity } from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";
import { IActivity } from "@/types/ModelTypes";
import { TPriceBody, TPriceMethod } from "@/types/vendorPriceListEditTypes";
import { AxiosResponse } from "axios";
export interface LocationPrice {
  location?: any;
  fromLocation?: any;
  toLocation?: any;
  price: number;
}

export type PricingMethod = "perItem" | "perLocation" | "perTrip";

export interface SubActivityPrice {
  _id?: string;
  subActivity:
    | string
    | {
        _id: string;
        transactionType: any;
        activity: IActivity;
        financeEffect: string;
        pricingMethod: string;
        portalItemNameEn: string;
        portalItemNameAr: string;
        isUsedByFinance: boolean;
        isUsedByOps: boolean;
        isInShippingUnit: boolean;
        isActive: boolean;
        isInSpecialRequirement: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
        id: string;
      }
    | {
        subActivity: SubActivity;
        locationPrices?: LocationPrice[];
        pricingMethod: string;
        _id: string;
      };
  pricingMethod: PricingMethod;
  basePrice?: number; // only for 'perItem'
  cost: number;
  locationPrices?: LocationPrice[]; // only for 'perLocation'
}

export interface PriceList {
  _id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  effectiveFrom: string; // ISO date string
  effectiveTo: string; // ISO date string
  isActive: boolean;
  subActivityPrices?: SubActivityPrice[];
}

class PriceListService {
  async getPriceLists(
    page?: number,
    limit?: number
  ): Promise<
    AxiosResponse<{
      data: PriceList[];
      message?: string;
      pagination: {
        currentPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        itemsPerPage: number;
        nextPage: number | null;
        prevPage: number | null;
        totalItems: number;
        totalPages: number;
      };
    }>
  > {
    return await http.get(apiUrlConstants.priceLists, {
      params: {
        page,
        limit,
      },
    });
  }

  async createPriceList(priceList: PriceList) {
    return await http.post(apiUrlConstants.priceLists, priceList);
  }

  async addSubActivityToPriceList(data: TPriceBody<TPriceMethod>) {
    return await http.post<{ message?: string; data?: PriceList }>(
      `${apiUrlConstants.priceLists}/${data.priceListId}/sub-activity`,
      { ...data, subActivity: data.subActivityId }
    );
  }

  async getPriceListById(id: string) {
    return await http.get(`${apiUrlConstants.priceLists}/${id}`);
  }

  async updatePriceList(id: string, priceList: PriceList) {
    return await http.put(`${apiUrlConstants.priceLists}/${id}`, priceList);
  }

  async deletePriceList(id: string) {
    return await http.delete(`${apiUrlConstants.priceLists}/${id}`);
  }

  async deleteSubActivityFromPriceList(
    priceListId: string,
    subActivityId: string
  ) {
    return await http.delete(
      `${apiUrlConstants.priceLists}/${priceListId}/sub-activity/${subActivityId}`
    );
  }

  async updateSubActivityPrice(
    priceListId: string,
    subActivityId: string,
    data: {
      basePrice?: number;
      locationPrices?: LocationPrice[];
    }
  ) {
    return await http.put(
      `${apiUrlConstants.priceLists}/${priceListId}/sub-activity/${subActivityId}`,
      {
        ...data,
      }
    );
  }

  async getPriceListBySubActivity(
    subActivityId: string,
    fromLocationId: string,
    toLocationId: string
  ) {
    return await http.get(
      `${apiUrlConstants.priceLists}/sub-activity?subActivityId=${subActivityId}&fromLocationId=${fromLocationId}&toLocationId=${toLocationId}`
    );
  }
}

export default new PriceListService();
