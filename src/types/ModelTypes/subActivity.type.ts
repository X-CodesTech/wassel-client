import { IActivity, ITransaction, TFinanceEffect, TPricingMethod } from ".";

export interface ISubActivity {
  transactionType: ITransaction | string;
  activity: IActivity | string;
  financeEffect: TFinanceEffect;
  pricingMethod: TPricingMethod;
  portalItemNameEn: string;
  portalItemNameAr: string;
  isUsedByFinance: boolean;
  isUsedByOps: boolean;
  isInShippingUnit: boolean;
  isActive: boolean;
  isInSpecialRequirement: boolean;
}
