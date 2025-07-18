/**
 * Types for the frontend
 * These include all the types needed for the application to function
 */
import { z } from "zod";

export interface Activity {
  _id?: string;
  actSrl: string;
  activityTransactionType: string;
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
  createdAt?: string;
  updatedAt?: string;
  subActivities?: any[];
}

export interface SubActivity {
  _id?: string;
  activity: string | Activity;
  transactionType: TransactionType;
  financeEffect: "none" | "positive" | "negative";
  pricingMethod: "perLocation" | "perItem" | "perTrip";
  portalItemNameEn: string;
  portalItemNameAr: string;
  isUsedByFinance: boolean;
  isUsedByOps: boolean;
  isInShippingUnit: boolean;
  isActive: boolean;
  isInSpecialRequirement: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActivityWithSubActivities {
  activity: Activity;
  subActivities: SubActivity[];
}

export interface TransactionType {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Schemas for form validation - copied from shared schema
export const activitySchema = z.object({
  id: z.number().optional(),
  actSrl: z.string().min(1, "Serial number is required"),
  activityCode: z.string().min(1, "Activity code is required"),
  activityType: z.string().min(1, "Activity type is required"),
  activityName: z.string().min(1, "Activity name is required"),
  isWithItems: z.boolean().default(false),
  financeEffect: z.string().default("No"),
  active: z.boolean().default(true),
});

export const subActivitySchema = z.object({
  id: z.number().optional(),
  parentId: z.number().int().positive("Parent activity is required"),
  itmSrl: z.number().int().positive("Item serial is required"),
  itemCode: z.string().min(1, "Item code is required"),
  itemName: z.string().min(1, "Item name is required"),
  activityName: z.string().min(1, "Activity name is required"),
  activityType: z.string().min(1, "Activity type is required"),
  pricingMethod: z.string().min(1, "Pricing method is required"),
  active: z.boolean().default(true),
});

export const insertActivitySchema = activitySchema.omit({ id: true });
export const insertSubActivitySchema = subActivitySchema.omit({ id: true });

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertSubActivity = z.infer<typeof insertSubActivitySchema>;

// Transaction Type schema
export const transactionTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Transaction name is required"),
  createdAt: z.date().optional(),
});

export const insertTransactionTypeSchema = transactionTypeSchema.omit({
  id: true,
});
export type InsertTransactionType = z.infer<typeof insertTransactionTypeSchema>;

// Location schemas
export const countrySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Country name is required"),
  code: z.string().min(1, "Country code is required"),
  active: z.boolean().default(true),
});

export const areaSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Area name is required"),
  countryId: z.number().int().positive("Country is required"),
  active: z.boolean().default(true),
});

export const citySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "City name is required"),
  areaId: z.number().int().positive("Area is required"),
  active: z.boolean().default(true),
});

export const villageSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Village name is required"),
  cityId: z.number().int().positive("City is required"),
  active: z.boolean().default(true),
});

export const insertCountrySchema = countrySchema.omit({ id: true });
export const insertAreaSchema = areaSchema.omit({ id: true });
export const insertCitySchema = citySchema.omit({ id: true });
export const insertVillageSchema = villageSchema.omit({ id: true });

export type Country = z.infer<typeof countrySchema>;
export type Area = z.infer<typeof areaSchema>;
export type City = z.infer<typeof citySchema>;
export type Village = z.infer<typeof villageSchema>;

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertArea = z.infer<typeof insertAreaSchema>;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertVillage = z.infer<typeof insertVillageSchema>;

// Location interface and schema
export interface Location {
  _id: string;
  country: string;
  countryAr: string;
  area: string;
  areaAr: string;
  city: string;
  cityAr: string;
  village: string;
  villageAr: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const locationSchema = z.object({
  _id: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  countryAr: z.string().min(1, "Country (Arabic) is required"),
  area: z.string().min(1, "Area is required"),
  areaAr: z.string().min(1, "Area (Arabic) is required"),
  city: z.string().min(1, "City is required"),
  cityAr: z.string().min(1, "City (Arabic) is required"),
  village: z.string().min(1, "Village is required"),
  villageAr: z.string().min(1, "Village (Arabic) is required"),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertLocationSchema = locationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;

// Location filter interface
export interface LocationFilters {
  country?: string;
  area?: string;
  city?: string;
  isActive?: boolean;
}

// Order interface and schemas
export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  serviceType: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  pickupLocation: string;
  deliveryLocation: string;
  requestedDate: string;
  createdAt: string;
  totalAmount?: number;
}

export const orderSchema = z.object({
  id: z.number().optional(),
  orderNumber: z.string().min(1, "Order number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  serviceType: z.string().min(1, "Service type is required"),
  status: z
    .enum(["pending", "in-progress", "completed", "cancelled"])
    .default("pending"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  requestedDate: z.string().min(1, "Requested date is required"),
  createdAt: z.string().optional(),
  totalAmount: z.number().optional(),
});

export const insertOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Vendor interface and schemas
export interface Vendor {
  _id: string;
  vendAccount: string;
  vendName: string;
  blocked: boolean;
  vendGroupId: string;
  createdDate: string;
  updatedAt: string;
}

export const vendorSchema = z.object({
  _id: z.string().optional(),
  vendAccount: z.string().min(1, "Vendor account is required"),
  vendName: z.string().min(1, "Vendor name is required"),
  blocked: z.boolean().default(false),
  vendGroupId: z.string().min(1, "Vendor group ID is required"),
  createdDate: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertVendorSchema = vendorSchema.omit({
  _id: true,
  createdDate: true,
  updatedAt: true,
});
export type InsertVendor = z.infer<typeof insertVendorSchema>;

// Vendor filter interface
export interface VendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdDate" | "vendName" | "vendAccount";
  sortOrder?: "asc" | "desc";
}

// Vendor response interface
export interface VendorResponse {
  activeVendorsCount: number;
  data: Vendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Customer interfaces and schemas
export interface Customer {
  blocked: boolean;
  companyChainId: string;
  createdDate: string;
  custAccount: string;
  custName: string;
}

export interface CustomerPriceItem {
  _id: string;
  subActivityId: string;
  subActivityName: string;
  price: number;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdDate" | "custName" | "custAccount";
  sortOrder?: "asc" | "desc";
}

export interface CustomerResponse {
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerImportResponse {
  message: string;
  stats: {
    total: number;
    inserted: number;
    updated: number;
    unchanged: number;
    failed: number;
  };
}

export const customerSchema = z.object({
  blocked: z.boolean().default(false),
  companyChainId: z.string().min(1, "Company chain ID is required"),
  createdDate: z.string().min(1, "Created date is required"),
  custAccount: z.string().min(1, "Customer account is required"),
  custName: z.string().min(1, "Customer name is required"),
});

export const insertCustomerSchema = customerSchema.omit({
  createdDate: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// Order interfaces and schemas for 3-step creation process
export interface CreateOrderStep1Request {
  service: string;
  typesOfGoods: string;
  goodsDescription: string;
  billingAccount: string;
  requesterName: string;
  requesterMobile1: string;
  requesterMobile2?: string;
  emailAddress: string;
}

export interface CreateOrderStep1Response {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    service: string;
    typesOfGoods: string;
    goodsDescription: string;
    billingAccount: string;
    requesterName: string;
    requesterMobile1: string;
    requesterMobile2?: string;
    emailAddress: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface PickupSpecialRequirement {
  subActivity: string;
  quantity: number;
  note?: string;
}

export interface DeliverySpecialRequirement {
  subActivity: string;
  quantity: number;
  note?: string;
}

export interface Coordinator {
  requesterName: string;
  requesterMobile1: string;
  requesterMobile2?: string;
  emailAddress: string;
}

export interface PickupInfo {
  pickupLocation: string;
  pickupDetailedAddress: string;
  fromTime: string;
  toTime: string;
  pickupSpecialRequirements: PickupSpecialRequirement[];
  otherRequirements?: string;
  pickupNotes?: string;
  pickupCoordinator: Coordinator;
}

export interface DeliveryInfo {
  deliveryLocation: string;
  deliveryDetailedAddress: string;
  fromTime: string;
  toTime: string;
  deliverySpecialRequirements: DeliverySpecialRequirement[];
  otherRequirements?: string;
  deliveryNotes?: string;
  deliveryCoordinator: Coordinator;
}

export interface CreateOrderStep2Request {
  pickupInfo: PickupInfo[];
  deliveryInfo: DeliveryInfo[];
}

export interface CreateOrderStep2Response {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    pickupInfo: PickupInfo[];
    deliveryInfo: DeliveryInfo[];
    status: string;
    updatedAt: string;
  };
  message: string;
}

export interface CreateOrderStep3Request {
  shippingUnits: string;
  typeOfTruck: string;
  qty: number;
  dimM: number;
  length: number;
  width: number;
  height: number;
  totalWeight: number;
  note?: string;
}

export interface CreateOrderStep3Response {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    shippingUnits: string;
    typeOfTruck: string;
    qty: number;
    dimM: number;
    length: number;
    width: number;
    height: number;
    totalWeight: number;
    note?: string;
    status: string;
    updatedAt: string;
  };
  message: string;
}

export interface GetOrderResponse {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    service: string;
    typesOfGoods: string;
    goodsDescription: string;
    billingAccount: string;
    requesterName: string;
    requesterMobile1: string;
    requesterMobile2?: string;
    emailAddress: string;
    pickupInfo?: PickupInfo[];
    deliveryInfo?: DeliveryInfo[];
    shippingUnits?: string;
    typeOfTruck?: string;
    qty?: number;
    dimM?: number;
    length?: number;
    width?: number;
    height?: number;
    totalWeight?: number;
    note?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface AddItemRequest {
  itemId: string;
  quantity: number;
  notes?: string;
}

export interface AddItemResponse {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    items: Array<{
      itemId: string;
      quantity: number;
      notes?: string;
    }>;
    updatedAt: string;
  };
  message: string;
}

export interface DeleteItemRequest {
  itemId: string;
}

export interface DeleteItemResponse {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    items: Array<{
      itemId: string;
      quantity: number;
      notes?: string;
    }>;
    updatedAt: string;
  };
  message: string;
}

export interface CalculatePriceRequest {
  // Add any specific parameters needed for price calculation
  includeTax?: boolean;
  currency?: string;
}

export interface CalculatePriceResponse {
  success: boolean;
  data: {
    orderId: string;
    totalPrice: number;
    currency: string;
    breakdown: {
      basePrice: number;
      specialRequirements: number;
      taxes: number;
      fees: number;
    };
  };
  message: string;
}

export interface GetPriceBreakdownResponse {
  success: boolean;
  data: {
    orderId: string;
    totalPrice: number;
    currency: string;
    breakdown: {
      basePrice: number;
      specialRequirements: number;
      taxes: number;
      fees: number;
      items: Array<{
        itemId: string;
        itemName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    };
  };
  message: string;
}

// Zod schemas for validation
export const createOrderStep1Schema = z.object({
  service: z.string().min(1, "Service is required"),
  typesOfGoods: z.string().min(1, "Types of goods is required"),
  goodsDescription: z.string().min(1, "Goods description is required"),
  billingAccount: z.string().min(1, "Billing account is required"),
  requesterName: z.string().min(1, "Requester name is required"),
  requesterMobile1: z.string().min(1, "Primary mobile is required"),
  requesterMobile2: z.string().optional(),
  emailAddress: z.string().email("Valid email address is required"),
});

export const pickupSpecialRequirementSchema = z.object({
  subActivity: z.string().min(1, "Sub activity is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  note: z.string().optional(),
});

export const deliverySpecialRequirementSchema = z.object({
  subActivity: z.string().min(1, "Sub activity is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  note: z.string().optional(),
});

export const coordinatorSchema = z.object({
  requesterName: z.string().min(1, "Coordinator name is required"),
  requesterMobile1: z.string().min(1, "Primary mobile is required"),
  requesterMobile2: z.string().optional(),
  emailAddress: z.string().email("Valid email address is required"),
});

export const pickupInfoSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupDetailedAddress: z.string().min(1, "Pickup address is required"),
  fromTime: z.string().min(1, "From time is required"),
  toTime: z.string().min(1, "To time is required"),
  pickupSpecialRequirements: z.array(pickupSpecialRequirementSchema),
  otherRequirements: z.string().optional(),
  pickupNotes: z.string().optional(),
  pickupCoordinator: coordinatorSchema,
});

export const deliveryInfoSchema = z.object({
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  deliveryDetailedAddress: z.string().min(1, "Delivery address is required"),
  fromTime: z.string().min(1, "From time is required"),
  toTime: z.string().min(1, "To time is required"),
  deliverySpecialRequirements: z.array(deliverySpecialRequirementSchema),
  otherRequirements: z.string().optional(),
  deliveryNotes: z.string().optional(),
  deliveryCoordinator: coordinatorSchema,
});

export const createOrderStep2Schema = z.object({
  pickupInfo: z
    .array(pickupInfoSchema)
    .min(1, "At least one pickup info is required"),
  deliveryInfo: z
    .array(deliveryInfoSchema)
    .min(1, "At least one delivery info is required"),
});

export const createOrderStep3Schema = z.object({
  shippingUnits: z.string().min(1, "Shipping units is required"),
  typeOfTruck: z.string().min(1, "Type of truck is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  dimM: z.number().min(1, "Dimensions must be at least 1"),
  length: z.number().min(1, "Length must be at least 1"),
  width: z.number().min(1, "Width must be at least 1"),
  height: z.number().min(1, "Height must be at least 1"),
  totalWeight: z.number().min(1, "Total weight must be at least 1"),
  note: z.string().optional(),
});

// Type exports
export type CreateOrderStep1Data = z.infer<typeof createOrderStep1Schema>;
export type CreateOrderStep2Data = z.infer<typeof createOrderStep2Schema>;
export type CreateOrderStep3Data = z.infer<typeof createOrderStep3Schema>;
export type PickupSpecialRequirementData = z.infer<
  typeof pickupSpecialRequirementSchema
>;
export type DeliverySpecialRequirementData = z.infer<
  typeof deliverySpecialRequirementSchema
>;
export type CoordinatorData = z.infer<typeof coordinatorSchema>;
export type PickupInfoData = z.infer<typeof pickupInfoSchema>;
export type DeliveryInfoData = z.infer<typeof deliveryInfoSchema>;
