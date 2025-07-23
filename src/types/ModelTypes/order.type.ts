import { IActivity, ICustomer, ILocation, ISubActivity } from ".";

export interface IPickupSpecialRequirement {
  subActivity: ISubActivity | string;
  quantity: number;
  note: string;
}

export interface IPickupCoordinator {
  requesterName: string;
  requesterMobile1: string;
  requesterMobile2: string;
  emailAddress: string;
}

export interface IPickupInfo {
  pickupLocation: ILocation | string;
  pickupDetailedAddress: string;
  fromTime: Date;
  toTime: Date;
  pickupSpecialRequirements: IPickupSpecialRequirement[];
  otherRequirements: string;
  pickupNotes: string;
  pickupCoordinator: IPickupCoordinator;
}

export interface IDeliverySpecialRequirement {
  subActivity: ISubActivity | string;
  quantity: number;
  note: string;
}

export interface IDeliveryCoordinator {
  requesterName: string;
  requesterMobile1: string;
  requesterMobile2: string;
  emailAddress: string;
}

export interface IDeliveryInfo {
  deliveryLocation: ILocation | string;
  deliveryDetailedAddress: string;
  fromTime: Date;
  toTime: Date;
  deliverySpecialRequirements: IDeliverySpecialRequirement[];
  otherRequirements: string;
  deliveryNotes: string;
  deliveryCoordinator: IDeliveryCoordinator;
}

export interface IShippingDetails {
  typeOfTruck: ISubActivity | string;
  shippingUnits: IActivity | string;
  qty: number;
  dimM: number;
  length: number;
  width: number;
  height: number;
  totalWeight: number;
  note: string;
}

export interface IOrder {
  service: string;
  typesOfGoods: string;
  goodsDescription: string;
  billingAccount: ICustomer | string;
  requesterName: string;
  requesterMobile1: string;
  requesterMobile2: string;
  emailAddress: string;
  pickupInfo: IPickupInfo[];
  pickupDetailedAddress: string;
  fromTime: Date;
  toTime: Date;
  pickupSpecialRequirements: IPickupSpecialRequirement[];
  otherRequirements: string;
  pickupNotes: string;
  pickupCoordinator: IPickupCoordinator;
  deliveryInfo: IDeliveryInfo[];
  shippingDetails: IShippingDetails;
  truckTypeMatches: any;
  specialRequirementsPrices: any;
  contactPerson: string;
  isDraft: boolean;
}
