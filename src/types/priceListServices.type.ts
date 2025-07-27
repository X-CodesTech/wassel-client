export type TPricingMethod = "perItem" | "perLocation" | "perTrip";

export type TUpdatePriceListSubActivityPriceResponse = {
  message?: string;
  data?: TPriceList;
};

export type TPriceList = {
  _id?: string;
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  isActive?: boolean;
  isDefault?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  subActivityPrices?: SubActivityPrice[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
};

export type SubActivityPrice = {
  subActivity?: SubActivity;
  locationPrices?: LocationPrice[];
  pricingMethod?: TPricingMethod;
  _id?: string;
  basePrice?: number;
};

export type LocationPrice = {
  fromLocation?: Location;
  toLocation?: Location;
  price?: number;
  pricingMethod?: TPricingMethod;
  _id?: string;
  location?: Location;
};

export type Location = {
  _id?: string;
  country?: string;
  countryAr?: string;
  area?: string;
  areaAr?: string;
  city?: string;
  cityAr?: string;
  village?: string;
  villageAr?: string;
  isActive?: boolean;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubActivity = {
  _id?: string;
  transactionType?: TransactionType | null;
  activity?: Activity | null;
  financeEffect?: string;
  pricingMethod?: TPricingMethod;
  portalItemNameEn?: string;
  portalItemNameAr?: string;
  isUsedByFinance?: boolean;
  isUsedByOps?: boolean;
  isInShippingUnit?: boolean;
  isActive?: boolean;
  isInSpecialRequirement?: boolean;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
  id?: string;
};

export type Activity = {
  _id?: string;
  actSrl?: string;
  activityTransactionType?: string;
  activityNameEn?: string;
  activityNameAr?: string;
  activityCode?: string;
  portalActivityNameEn?: string;
  portalActivityNameAr?: string;
  isWithItems?: boolean;
  isOpsActive?: boolean;
  isPortalActive?: boolean;
  isInOrderScreen?: boolean;
  isInShippingUnit?: boolean;
  isActive?: boolean;
  isInSpecialRequirement?: boolean;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
  id?: string;
};

export type TransactionType = {
  _id?: string;
  name?: string;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
