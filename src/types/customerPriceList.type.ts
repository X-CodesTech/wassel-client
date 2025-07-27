type TLocationPrice = {
  location: string;
  cost: number;
};

type TLocationFromToPrice = {
  fromLocation: string;
  toLocation: string;
} & ({ price: number; cost?: never } | { cost: number; price?: never });

export type TPricingMethod = "perLocation" | "perTrip" | "perItem";

interface IMultipleOptions {
  pricingMethod: TPricingMethod;
  priceListId: string;
  subActivityId: string;
}

export interface IPerLocation extends IMultipleOptions {
  pricingMethod: "perLocation";
  locationPrices: TLocationPrice[];
}

export interface IPerTrip extends IMultipleOptions {
  pricingMethod: "perTrip";
  locationPrices: TLocationFromToPrice[];
}

export interface IPerItem extends IMultipleOptions {
  pricingMethod: "perItem";
  basePrice: number;
}

export type TCustomerPriceListBody<T extends TPricingMethod> =
  T extends "perItem"
    ? IPerItem
    : T extends "perLocation"
    ? IPerLocation
    : T extends "perTrip"
    ? IPerTrip
    : never;
