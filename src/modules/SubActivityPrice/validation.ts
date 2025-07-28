import { z } from "zod";

// common fields
const baseFields = {
  subActivity: z.string().min(1, "Sub activity is required"),
};

// per‐item schema
const perItemSchema = z
  .object({
    ...baseFields,
    pricingMethod: z.literal("perItem"),
    basePrice: z.number().min(0, "Base price must be positive"),
  })
  .strict(); // disallow any extra keys (e.g. locationPrices)

// per‐location schema
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
            price: z.number().min(0, "Price must be positive"),
            _originalLocation: z.object({}).optional(),
          })
          .strict()
      )
      .min(1, "At least one location price is required"),
  })
  .strict();

// per‐trip schema
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
            price: z.number().min(0, "Price must be positive"),
            _originalFromLocation: z.object({}).optional(),
            _originalToLocation: z.object({}).optional(),
          })
          .strict()
      )
      .min(1, "At least one trip price is required"),
  })
  .strict();

// discriminated union on pricingMethod
export const formSchema = z.discriminatedUnion("pricingMethod", [
  perItemSchema,
  perLocationSchema,
  perTripSchema,
]);

export type TFormSchema = z.infer<typeof formSchema>;
