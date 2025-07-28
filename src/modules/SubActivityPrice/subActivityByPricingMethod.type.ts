// Base types for nested objects
interface TransactionType {
  _id: string;
  name: string;
}

interface Activity {
  _id: string;
  activityNameEn: string;
  activityNameAr: string;
}

// Enum-like string unions for known values
type FinanceEffect = "positive" | "negative";
type PricingMethod = "perItem" | "perLocation" | "perTrip";

// Main data item interface
interface PortalItem {
  _id: string;
  transactionType: TransactionType | null;
  activity: Activity | null;
  financeEffect: FinanceEffect;
  pricingMethod: PricingMethod;
  portalItemNameEn: string;
  portalItemNameAr: string;
  isUsedByFinance: boolean;
  isUsedByOps: boolean;
  isInShippingUnit: boolean;
  isActive: boolean;
  isInSpecialRequirement: boolean;
}

// Top-level response structure
interface ISubActivityByPricingMethod {
  success: boolean;
  data: PortalItem[];
}

interface ApiErrorDetail {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

interface ApiErrorResponse {
  errors: ApiErrorDetail[];
}
