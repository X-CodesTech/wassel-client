import { ILocation, IVendor, ISubActivity, TPricingMethod } from ".";

export interface IVendorLocationPrice {
  location: ILocation | string;
  fromLocation: ILocation | string;
  toLocation: ILocation | string;
  cost: number;
  pricingMethod: TPricingMethod;
}

export interface IVendorSubActivityPrice {
  subActivity: ISubActivity | string;
  cost: number;
  locationPrices: IVendorLocationPrice[];
  pricingMethod: TPricingMethod;
}

export interface VendorPriceList {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  vendor: IVendor | string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date;
  subActivityPrices: IVendorSubActivityPrice[];
}
