import { z } from "zod";
import { SubActivityResponse } from "./types";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";

// Validation schemas
export const locationPriceSchema = z.object({
  location: z.string().min(1, "Location is required"),
  cost: z.number().min(0, "Cost must be positive"),
});

export const subActivityPriceSchema = z.object({
  subActivity: z.string().min(1, "Sub activity is required"),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
  cost: z.number().min(0, "Cost must be positive"),
});

export const vendorPriceListSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  subActivity: z.string().min(1, "Sub activity is required"),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
  cost: z.number().min(0, "Cost must be positive"),
  locationPrices: z.array(locationPriceSchema).optional(),
});

// Type definitions
export type VendorPriceListFormData = z.infer<typeof vendorPriceListSchema>;
export type SubActivityPriceFormData = z.infer<typeof subActivityPriceSchema>;
export type LocationPriceFormData = z.infer<typeof locationPriceSchema>;

// Interface for form props
export interface VendorPriceListFormProps {
  vendorId: string;
  initialData?: UpdateVendorPriceListRequest;
  onSubmit: (
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Interface for sub activity component props
export interface SubActivityFormProps {
  form: any;
  subActivities: SubActivityResponse["data"];
}

// Interface for location prices component props
export interface LocationPricesFormProps {
  form: any;
}

// Pricing method types
export type PricingMethod = "perLocation" | "perItem" | "perTrip";

// Default form values
export const getDefaultSubActivityPrice = (): SubActivityPriceFormData => ({
  subActivity: "",
  pricingMethod: "perItem",
  cost: 0,
});

export const getDefaultLocationPrice = (): LocationPriceFormData => ({
  location: "",
  cost: 0,
});
