import { z } from "zod";

// Common validation patterns
export const commonValidation = {
  requiredString: z.string().min(1, "This field is required"),
  optionalString: z.string().optional(),
  requiredBoolean: z.boolean(),
  optionalBoolean: z.boolean().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number"),
} as const;

// Activity validation schema
export const activityValidationSchema = z.object({
  actSrl: commonValidation.requiredString,
  activityCode: commonValidation.requiredString,
  activityNameEn: commonValidation.requiredString,
  activityNameAr: commonValidation.requiredString,
  activityTransactionType: commonValidation.requiredString,
  portalActivityNameEn: commonValidation.requiredString,
  portalActivityNameAr: commonValidation.requiredString,
  isWithItems: commonValidation.requiredBoolean,
  isActive: commonValidation.requiredBoolean,
  isOpsActive: commonValidation.requiredBoolean,
  isPortalActive: commonValidation.requiredBoolean,
  isInOrderScreen: commonValidation.requiredBoolean,
  isInShippingUnit: commonValidation.requiredBoolean,
  isInSpecialRequirement: commonValidation.requiredBoolean,
});

// Sub-activity validation schema
export const subActivityValidationSchema = z.object({
  activity: commonValidation.requiredString,
  transactionType: commonValidation.requiredString,
  financeEffect: z.enum(["none", "positive", "negative"]),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
  portalItemNameEn: commonValidation.requiredString,
  portalItemNameAr: commonValidation.requiredString,
  isUsedByFinance: commonValidation.requiredBoolean,
  isUsedByOps: commonValidation.requiredBoolean,
  isInShippingUnit: commonValidation.requiredBoolean,
  isActive: commonValidation.requiredBoolean,
  isInSpecialRequirement: commonValidation.requiredBoolean,
});

// Customer validation schema
export const customerValidationSchema = z.object({
  custAccount: commonValidation.requiredString,
  custName: commonValidation.requiredString,
  companyChainId: commonValidation.requiredString,
  blocked: commonValidation.requiredBoolean,
});

// Vendor validation schema
export const vendorValidationSchema = z.object({
  vendAccount: commonValidation.requiredString,
  vendName: commonValidation.requiredString,
  vendGroupId: commonValidation.requiredString,
  blocked: commonValidation.requiredBoolean,
});

// Order validation schema
export const orderValidationSchema = z.object({
  orderNumber: commonValidation.requiredString,
  customerName: commonValidation.requiredString,
  serviceType: commonValidation.requiredString,
  status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
  pickupLocation: commonValidation.requiredString,
  deliveryLocation: commonValidation.requiredString,
  requestedDate: commonValidation.requiredString,
  totalAmount: z.number().optional(),
});

// Export types
export type ActivityFormData = z.infer<typeof activityValidationSchema>;
export type SubActivityFormData = z.infer<typeof subActivityValidationSchema>;
export type CustomerFormData = z.infer<typeof customerValidationSchema>;
export type VendorFormData = z.infer<typeof vendorValidationSchema>;
export type OrderFormData = z.infer<typeof orderValidationSchema>;
