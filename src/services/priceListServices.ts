import { SubActivity } from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";
export interface LocationPrice {
  location: string;
  price: number;
}

export type PricingMethod = "perItem" | "perLocation";

export interface SubActivityPrice {
  _id?: string;
  subActivity:
    | string
    | {
        _id: string;
        transactionType: any;
        activity: any;
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
        locationPrices: LocationPrice[];
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
  subActivityPrices: SubActivityPrice[];
}

class PriceListService {
  async getPriceLists() {
    return await http.get(apiUrlConstants.priceLists);
  }

  async createPriceList(priceList: PriceList) {
    return await http.post(apiUrlConstants.priceLists, priceList);
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
