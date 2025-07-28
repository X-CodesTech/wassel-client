import { z } from "zod";

type UserType = "vendor" | "customer" | "priceList";

// Field mapper: maps base field name → renamed key based on userType
const mapField = (field: string, userType: UserType): string => {
  const vendorFields: Record<string, string> = {
    price: "cost",
    basePrice: "baseCost",
  };

  return userType === "vendor" ? vendorFields[field] ?? field : field;
};

// Error message mapper
const getLabel = (field: string, userType: UserType): string => {
  const fieldLabel =
    userType === "vendor" ? field.replace("price", "cost") : field;
  const label = fieldLabel
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase()); // e.g. baseCost → "Base Cost"

  return `${label} must be positive`;
};

// Schema builder
export const createFormSchema = (userType: UserType) => {
  const baseFields = {
    subActivity: z.string().min(1, "Sub activity is required"),
  };

  const perItemSchema = z
    .object({
      ...baseFields,
      pricingMethod: z.literal("perItem"),
      [mapField("basePrice", userType)]: z
        .number()
        .min(0, getLabel("basePrice", userType)),
    })
    .strict();

  const perLocationSchema = z
    .object({
      ...baseFields,
      pricingMethod: z.literal("perLocation"),
      locationPrices: z
        .array(
          z
            .object({
              location: z.string().min(1, "Location is required"),
              pricingMethod: z.literal("perLocation"),
              [mapField("price", userType)]: z
                .number()
                .min(0, getLabel("price", userType)),
            })
            .strict()
        )
        .min(1, "At least one location price is required"),
    })
    .strict();

  const perTripSchema = z
    .object({
      ...baseFields,
      pricingMethod: z.literal("perTrip"),
      locationPrices: z
        .array(
          z
            .object({
              fromLocation: z.string().min(1, "From location is required"),
              toLocation: z.string().min(1, "To location is required"),
              pricingMethod: z.literal("perTrip"),
              [mapField("price", userType)]: z
                .number()
                .min(0, getLabel("price", userType)),
            })
            .strict()
        )
        .min(1, "At least one trip price is required"),
    })
    .strict();

  return z.discriminatedUnion("pricingMethod", [
    perItemSchema,
    perLocationSchema,
    perTripSchema,
  ]);
};
