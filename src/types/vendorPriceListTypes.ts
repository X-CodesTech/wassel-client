import { z } from "zod";
import { SubActivityResponse } from "./types";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";

// Validation schemas
export const locationPriceSchema = z.object({
  location: z.string().min(1, "Location is required"),
  pricingMethod: z.literal("perLocation"),
  cost: z.number().min(0, "Cost must be positive"),
});

export const tripLocationPriceSchema = z.object({
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  pricingMethod: z.literal("perTrip"),
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
  tripLocationPrices: z.array(tripLocationPriceSchema).optional(),
});

// Type definitions matching the required request body
export type VendorPriceListFormData = z.infer<typeof vendorPriceListSchema>;
export type SubActivityPriceFormData = z.infer<typeof subActivityPriceSchema>;
export type LocationPriceFormData = z.infer<typeof locationPriceSchema>;
export type TripLocationPriceFormData = z.infer<typeof tripLocationPriceSchema>;

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

// Interface for trip location prices component props
export interface TripLocationPricesFormProps {
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
  pricingMethod: "perLocation",
  cost: 0,
});

export const getDefaultTripLocationPrice = (): TripLocationPriceFormData => ({
  fromLocation: "",
  toLocation: "",
  pricingMethod: "perTrip",
  cost: 0,
});
