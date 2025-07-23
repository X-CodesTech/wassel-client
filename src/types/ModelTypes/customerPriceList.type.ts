import { ICustomer, IPriceList } from ".";

export interface ICustomerPriceList {
  customer: ICustomer | string;
  priceList: IPriceList | string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date;
}
