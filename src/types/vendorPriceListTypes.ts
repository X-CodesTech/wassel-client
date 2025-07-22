import { z } from "zod";
import { SubActivity, SubActivityResponse } from "./types";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";

// Validation schemas
export const locationPriceSchema = z.object({
  location: z.string().min(1, "Location is required"),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  cost: z.number().min(0, "Cost must be positive"),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
});

export const subActivityPriceSchema = z.object({
  subActivity: z.string().min(1, "Sub activity is required"),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
  cost: z.number().min(0, "Cost must be positive"),
  locationPrices: z.array(locationPriceSchema),
});

export const vendorPriceListSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  subActivityPrices: z
    .array(subActivityPriceSchema)
    .min(1, "At least one sub activity price is required"),
});

// Type definitions
export type VendorPriceListFormData = z.infer<typeof vendorPriceListSchema>;
export type LocationPriceFormData = z.infer<typeof locationPriceSchema>;
export type SubActivityPriceFormData = z.infer<typeof subActivityPriceSchema>;

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

// Interface for location prices component props
export interface SubActivityLocationPricesProps {
  form: any;
  subActivityIndex: number;
  pricingMethod: "perLocation" | "perTrip";
}

// Interface for sub activity component props
export interface SubActivityFormProps {
  form: any;
  index: number;
  subActivities: SubActivityResponse["data"];
  onRemove: (index: number) => void;
  canRemove: boolean;
}

// Pricing method types
export type PricingMethod = "perLocation" | "perItem" | "perTrip";

// Default form values
export const getDefaultSubActivityPrice = (): SubActivityPriceFormData => ({
  subActivity: "",
  pricingMethod: "perItem",
  cost: 0,
  locationPrices: [],
});

export const getDefaultLocationPrice = (
  pricingMethod: PricingMethod
): LocationPriceFormData => ({
  location: "",
  fromLocation: "",
  toLocation: "",
  cost: 0,
  pricingMethod,
});
