import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubActivityPrice, LocationPrice } from "@/services/priceListServices";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actUpdateSubActivityPrice } from "@/store/priceLists";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { actGetLocations } from "@/store/locations";
import { AsyncLocationSelect } from "@/components/ui/async-location-select";

interface PerLocationEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}

// per‐location schema for edit
const perLocationEditSchema = z
  .object({
    pricingMethod: z.literal("perLocation"),
    locationPrices: z
      .array(
        z
          .object({
            location: z.string().min(1, "Location is required"),
            pricingMethod: z.literal("perLocation"),
            price: z.number().min(0, "Price must be positive"),
          })
          .strict()
      )
      .min(1, "At least one location price is required"),
  })
  .strict();

type TPerLocationEditSchema = z.infer<typeof perLocationEditSchema>;

const PerLocationEditPriceListSubActivity = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: PerLocationEditPriceListSubActivityProps) => {
  const dispatch = useAppDispatch();
  const { records: locations } = useAppSelector((state) => state.locations);
  const { toast } = useToast();

  // Load locations if not already loaded
  useEffect(() => {
    if (locations.length === 0) {
      dispatch(actGetLocations({ filters: {}, page: 1, limit: 999999 }));
    }
  }, [dispatch, locations.length]);

  const getSubActivityId = (subActivity: any): string => {
    if (typeof subActivity === "string") {
      return subActivity;
    }
    if (
      subActivity &&
      typeof subActivity === "object" &&
      "_id" in subActivity
    ) {
      return subActivity._id;
    }
    return "";
  };

  const getLocationId = (location: any): string => {
    if (typeof location === "string") {
      return location;
    }
    if (location && typeof location === "object" && "_id" in location) {
      return location._id;
    }
    return "";
  };

  const subActivityId = getSubActivityId(selectedSubActivityPrice.subActivity);

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      pricingMethod: "perLocation" as const,
      locationPrices:
        selectedSubActivityPrice.locationPrices?.map((locationPrice) => ({
          location: getLocationId(locationPrice.location),
          pricingMethod: "perLocation" as const,
          price: locationPrice.price,
        })) || [],
    }),
    [selectedSubActivityPrice.locationPrices]
  );

  const form = useForm<TPerLocationEditSchema>({
    defaultValues,
    resolver: zodResolver(perLocationEditSchema),
    mode: "all", // Enable real-time validation
    reValidateMode: "onChange",
  });

  const {
    fields: locationPriceFields,
    remove: removeLocationPrice,
    append: appendLocationPrice,
  } = useFieldArray({
    control: form.control,
    name: "locationPrices",
  });

  // Watch location prices for validation
  const locationPrices = form.watch("locationPrices");

  // Reset form when selectedSubActivityPrice changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

  // Helper function to check if location is selected for perLocation pricing
  const isLocationSelected = (index: number) => {
    if (!locationPrices || !locationPrices[index]) return false;
    return !!locationPrices[index].location;
  };

  // Check if form is valid
  const isFormValid = form.formState.isValid;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  // Check if form has changes
  const hasFormChanges = useMemo(() => {
    const currentValues = form.getValues();
    const originalValues = defaultValues;

    // Check if arrays have different lengths
    if (
      currentValues.locationPrices.length !==
      originalValues.locationPrices.length
    ) {
      return true;
    }

    // Check if any values are different
    return currentValues.locationPrices.some((currentLocation, index) => {
      const originalLocation = originalValues.locationPrices[index];
      return (
        currentLocation.location !== originalLocation.location ||
        currentLocation.price !== originalLocation.price
      );
    });
  }, [form.watch(), defaultValues]);

  // Add new location handler
  const handleAddLocation = useCallback(() => {
    appendLocationPrice({
      location: "",
      pricingMethod: "perLocation" as const,
      price: 0,
    });
  }, [appendLocationPrice]);

  const onSubmit = (data: TPerLocationEditSchema) => {
    // Transform the data to match the expected API structure
    const transformedLocationPrices: LocationPrice[] = data.locationPrices.map(
      (lp) => ({
        pricingMethod: "perLocation",
        location: lp.location,
        price: lp.price,
      })
    );

    dispatch(
      actUpdateSubActivityPrice({
        priceListId,
        subActivityId,
        data: {
          locationPrices: transformedLocationPrices,
        },
      })
    )
      .unwrap()
      .catch((error) => {
        if (error.message) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive",
          });
        }
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Price list updated successfully",
        });
        onOpenChange(false);
      });
  };

  return (
    <Form {...form}>
      {selectedSubActivityPrice.pricingMethod === "perLocation" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Location Pricing</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!isFormValid || hasErrors}
              onClick={handleAddLocation}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>

          <div className="space-y-4">
            {locationPriceFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <FormField
                  control={form.control}
                  name={`locationPrices.${index}.location`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <AsyncLocationSelect
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear focus from any active element after location selection
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                          placeholder="Select location"
                          useAddressString={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`locationPrices.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={!isLocationSelected(index)}
                          onFocus={(e) => {
                            if (!isLocationSelected(index)) {
                              e.target.blur();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {locationPriceFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLocationPrice(index)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex justify-end space-x-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={!isFormValid || hasErrors || !hasFormChanges}
        >
          Save
        </Button>
      </div>
    </Form>
  );
};

export default PerLocationEditPriceListSubActivity;
