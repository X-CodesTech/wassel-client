// validation.ts - Updated with proper type exports
import { z } from "zod";

type UserType = "vendor" | "customer" | "priceList";

// Schema builder
export const createFormSchema = (userType: UserType) => {
  const baseFields = {
    subActivity: z.string().min(1, "Sub activity is required"),
  };

  const perItemSchema = z.object({
    ...baseFields,
    pricingMethod: z.literal("perItem"),
    // Use the actual field names that the form uses
    ...(userType === "vendor"
      ? { cost: z.number().min(0, "Cost must be positive") }
      : { basePrice: z.number().min(0, "Base price must be positive") }),
  });

  const perLocationSchema = z.object({
    ...baseFields,
    pricingMethod: z.literal("perLocation"),
    locationPrices: z
      .array(
        z.object({
          location: z.string().min(1, "Location is required"),
          pricingMethod: z.literal("perLocation"),
          // Always use 'price' for locationPrices regardless of userType
          price: z.number().min(0, "Price must be positive"),
        })
      )
      .min(1, "At least one location price is required"),
  });

  const perTripSchema = z.object({
    ...baseFields,
    pricingMethod: z.literal("perTrip"),
    locationPrices: z
      .array(
        z.object({
          fromLocation: z.string().min(1, "From location is required"),
          toLocation: z.string().min(1, "To location is required"),
          pricingMethod: z.literal("perTrip"),
          // Always use 'cost' for perTrip regardless of userType
          cost: z.number().min(0, "Cost must be positive"),
        })
      )
      .min(1, "At least one trip price is required"),
  });

  return z.discriminatedUnion("pricingMethod", [
    perItemSchema,
    perLocationSchema,
    perTripSchema,
  ]);
};

// Type helper for better TypeScript inference
export type FormSchemaType<T extends UserType> = z.infer<
  ReturnType<typeof createFormSchema>
>;
