import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubActivityPrice } from "@/services/vendorServices";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actEditVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors/vendorsSlice";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo, useCallback } from "react";
import { actGetLocations } from "@/store/locations";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, AutoSizer } from "react-virtualized";
import { cn } from "@/utils";
import { AsyncLocationSelect } from "@/components/ui/async-location-select";

const PerTripEditPriceCostList = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}) => {
  const dispatch = useAppDispatch();
  const { priceLists } = useAppSelector((state) => state.vendors);
  const { records: locations } = useAppSelector((state) => state.locations);

  const vendorId = priceLists?.[0]?.vendor?._id || "";
  const vendorPriceListId = priceListId;
  const subActivityId = selectedSubActivityPrice.subActivity._id || "";

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
        cost: z.number().min(0, "Cost must be positive"),
      })
    ),
  });

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      locationPrices: selectedSubActivityPrice.locationPrices.map(
        (locationPrice) => ({
          fromLocation: locationPrice.fromLocation?._id || "",
          toLocation: locationPrice.toLocation?._id || "",
          cost: locationPrice.cost,
        })
      ),
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

  // Reset form when selectedSubActivityPrice changes
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

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
        currentTrip.cost !== originalTrip.cost
      );
    });
  }, [form.watch(), defaultValues]);

  // Add new trip handler
  const handleAddTrip = useCallback(() => {
    appendLocationPrice({
      fromLocation: "",
      toLocation: "",
      cost: 0,
    });
  }, [appendLocationPrice]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    // Transform the data to match the expected API structure
    const transformedLocationPrices = data.locationPrices.map((lp) => ({
      fromLocation: lp.fromLocation,
      toLocation: lp.toLocation,
      cost: lp.cost,
    }));

    dispatch(
      actEditVendorSubActivityPrice({
        pricingMethod: "perTrip",
        vendorPriceListId,
        subActivityId,
        locationPrices: transformedLocationPrices as any, // Type assertion to work around type mismatch
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
        dispatch(actGetVendorPriceLists(vendorId));
        onOpenChange(false);
      });
  };

  // Virtualized row renderer
  const rowRenderer = ({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    style: React.CSSProperties;
  }) => {
    return (
      <div key={key} style={style} className="mb-4">
        <div className={cn(`border rounded-lg p-4 space-y-4`)}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Trip {index + 1}</h4>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeLocationPrice(index)}
            >
              Remove
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name={`locationPrices.${index}.fromLocation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Location</FormLabel>
                  <FormControl>
                    <AsyncLocationSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select from location"
                      useAddressString={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`locationPrices.${index}.toLocation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Location</FormLabel>
                  <FormControl>
                    <AsyncLocationSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select to location"
                      useAddressString={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`locationPrices.${index}.cost`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      {selectedSubActivityPrice.pricingMethod === "perTrip" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Trip Pricing</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTrip}
              disabled={!isFormValid || hasErrors}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Trip
            </Button>
          </div>

          <div className="h-96">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowCount={locationPriceFields.length}
                  rowHeight={170} // Approximate height of each trip item
                  rowRenderer={rowRenderer}
                  overscanRowCount={3} // Render 3 extra rows for smooth scrolling
                />
              )}
            </AutoSizer>
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

export default PerTripEditPriceCostList;
