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
import { useCallback, useEffect, useMemo } from "react";
import { cn } from "@/utils";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AsyncLocationSelect } from "@/components/ui/async-location-select";

type TPerLocationEditPriceCostListProps = {
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
  priceListId: string;
};

const PerLocationEditPriceCostList = ({
  onOpenChange,
  selectedSubActivityPrice,
  priceListId,
}: TPerLocationEditPriceCostListProps) => {
  const dispatch = useAppDispatch();
  const { priceLists } = useAppSelector((state) => state.vendors);

  const vendorId = priceLists?.[0]?.vendor?._id || "";
  const vendorPriceListId = priceListId;
  const subActivityId = selectedSubActivityPrice.subActivity._id || "";

  // Performance optimization states

  const schema = z.object({
    locationPrices: z.array(
      z.object({
        location: z.string().min(1, "Location is required"),
        cost: z.number().min(0, "Cost must be positive"),
      })
    ),
  });

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      locationPrices: selectedSubActivityPrice.locationPrices.map(
        (locationPrice) => ({
          location: locationPrice.location?._id || "",
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
    return currentValues.locationPrices.some((currentLocation, index) => {
      const originalLocation = originalValues.locationPrices[index];
      return (
        currentLocation.location !== originalLocation.location ||
        currentLocation.cost !== originalLocation.cost
      );
    });
  }, [form.watch(), defaultValues]);

  // Add new location handler
  const handleAddLocation = useCallback(() => {
    appendLocationPrice({
      location: "",
      cost: 0,
    });
  }, [appendLocationPrice]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    // Transform the data to match the expected API structure
    const transformedLocationPrices = data.locationPrices.map((lp) => ({
      location: lp.location,
      cost: lp.cost,
    }));

    dispatch(
      actEditVendorSubActivityPrice({
        pricingMethod: "perLocation",
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
            <h4 className="text-sm font-medium">Location {index + 1}</h4>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeLocationPrice(index)}
            >
              Remove
            </Button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            id="location-dropdown"
          >
            <FormField
              control={form.control}
              name={`locationPrices.${index}.location`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <AsyncLocationSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select location"
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
      {selectedSubActivityPrice.pricingMethod === "perLocation" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Location Pricing</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLocation}
              disabled={!isFormValid || hasErrors}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>

          <div className="h-96">
            <ScrollArea className="h-full">
              {locationPriceFields.map((field, index) => (
                <div key={field.id}>
                  {rowRenderer({ index, key: field.id, style: {} })}
                </div>
              ))}
            </ScrollArea>
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

export default PerLocationEditPriceCostList;
