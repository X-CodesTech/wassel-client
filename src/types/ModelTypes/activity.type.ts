import { ITransaction } from ".";

export interface IActivity {
  actSrl: string;
  activityTransactionType: ITransaction | string;
  activityNameEn: string;
  activityNameAr: string;
  activityCode: string;
  portalActivityNameEn: string;
  portalActivityNameAr: string;
  isWithItems: boolean;
  isOpsActive: boolean;
  isPortalActive: boolean;
  isInOrderScreen: boolean;
  isInShippingUnit: boolean;
  isActive: boolean;
  isInSpecialRequirement: boolean;
}
