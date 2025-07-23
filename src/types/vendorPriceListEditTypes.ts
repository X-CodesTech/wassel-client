type ILocationPrice = {
  location: string;
  cost: number;
};

type PriceMethod = "perLocation" | "perTrip" | "perItem";

interface IMultipleOptions {
  pricingMethod: PriceMethod;
  vendorPriceListId: string;
  subActivityId: string;
}

export interface IPerLocation extends IMultipleOptions {
  pricingMethod: "perLocation";
  locationPrices: ILocationPrice[];
}

export interface IPerTrip extends IMultipleOptions {
  pricingMethod: "perTrip";
  locationPrices: ILocationPrice[];
}

export interface IPerItem extends IMultipleOptions {
  pricingMethod: "perItem";
  cost: number;
}

export type TPriceBody<T extends PriceMethod> = T extends "perItem"
  ? IPerItem
  : T extends "perLocation"
  ? IPerLocation
  : T extends "perTrip"
  ? IPerTrip
  : never;
