import { ILocation, ISubActivity, TPricingMethod } from ".";

export interface ILocationPrice {
  location: ILocation | string;
  fromLocation: ILocation | string;
  toLocation: ILocation | string;
  price: number;
  pricingMethod: TPricingMethod;
}
export interface ISubActivityPrice {
  subActivity: ISubActivity | string;
  basePrice: number;
  locationPrices: ILocationPrice[];
  pricingMethod: TPricingMethod;
}
export interface IPriceList {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isActive: boolean;
  isDefault: boolean;
  effectiveFrom: Date;
  effectiveTo: Date;
  subActivityPrices: ISubActivityPrice[];
}
