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
import { useEffect, useMemo, useCallback } from "react";
import { actGetLocations } from "@/store/locations";
import { Plus, Trash2 } from "lucide-react";
import { AsyncLocationSelect } from "@/components/ui/async-location-select";

interface PerTripEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}

const PerTripEditPriceListSubActivity = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: PerTripEditPriceListSubActivityProps) => {
  const dispatch = useAppDispatch();
  const { records: locations } = useAppSelector((state) => state.locations);
  const { toast } = useToast();

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

  useEffect(() => {
    if (locations.length === 0) {
      dispatch(actGetLocations({ filters: {}, page: 1, limit: 999999 }));
    }
  }, [dispatch, locations?.length]);

  const schema = z.object({
    locationPrices: z.array(
      z.object({
        fromLocation: z.string().min(1, "From location is required"),
        toLocation: z.string().min(1, "To location is required"),
        price: z.number().min(0, "Price must be positive"),
      })
    ),
  });

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      locationPrices:
        selectedSubActivityPrice.locationPrices?.map((locationPrice) => ({
          fromLocation: getLocationId(locationPrice.fromLocation),
          toLocation: getLocationId(locationPrice.toLocation),
          price: locationPrice.price,
        })) || [],
    }),
    [selectedSubActivityPrice.locationPrices]
  );

  const form = useForm<z.infer<typeof schema>>({
    defaultValues,
    resolver: zodResolver(schema),
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

  // Helper function to check if both locations are selected for perTrip pricing
  const isTripLocationsSelected = (index: number) => {
    if (!locationPrices || !locationPrices[index]) return false;
    return !!(
      locationPrices[index].fromLocation && locationPrices[index].toLocation
    );
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
    return currentValues.locationPrices.some((currentTrip, index) => {
      const originalTrip = originalValues.locationPrices[index];
      return (
        currentTrip.fromLocation !== originalTrip.fromLocation ||
        currentTrip.toLocation !== originalTrip.toLocation ||
        currentTrip.price !== originalTrip.price
      );
    });
  }, [form.watch(), defaultValues]);

  // Add new trip handler
  const handleAddTrip = useCallback(() => {
    appendLocationPrice({
      fromLocation: "",
      toLocation: "",
      price: 0,
    });
  }, [appendLocationPrice]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    // Transform the data to match the expected API structure
    const transformedLocationPrices: LocationPrice[] = data.locationPrices.map(
      (lp) => ({
        pricingMethod: "perTrip",
        fromLocation: lp.fromLocation,
        toLocation: lp.toLocation,
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
      {selectedSubActivityPrice.pricingMethod === "perTrip" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Trip Pricing</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTrip}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Trip
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
                  name={`locationPrices.${index}.fromLocation`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>From Location</FormLabel>
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
                          placeholder="Select from location"
                          useAddressString={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`locationPrices.${index}.toLocation`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>To Location</FormLabel>
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
                          placeholder="Select to location"
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
                          disabled={!isTripLocationsSelected(index)}
                          onFocus={(e) => {
                            if (!isTripLocationsSelected(index)) {
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

export default PerTripEditPriceListSubActivity;
