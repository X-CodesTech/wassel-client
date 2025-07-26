import { AsyncPaginate } from "react-select-async-paginate";
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
import { SubActivityPrice, LocationPrice } from "@/services/priceListServices";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actUpdateSubActivityPrice } from "@/store/priceLists";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { actGetLocations } from "@/store/locations";
import locationServices from "@/services/locationServices";

interface PerLocationEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}

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

  // Performance optimization states
  const [searchTerm, setSearchTerm] = useState("");

  const schema = z.object({
    locationPrices: z.array(
      z.object({
        location: z.string().min(1, "Location is required"),
        price: z.number().min(0, "Price must be positive"),
      })
    ),
  });

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      locationPrices:
        selectedSubActivityPrice.locationPrices?.map((locationPrice) => ({
          location: getLocationId(locationPrice.location),
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
        currentLocation.price !== originalLocation.price
      );
    });
  }, [form.watch(), defaultValues]);

  // Add new location handler
  const handleAddLocation = useCallback(() => {
    appendLocationPrice({
      location: "",
      price: 0,
    });
  }, [appendLocationPrice]);

  const onSubmit = (data: z.infer<typeof schema>) => {
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

  // Optimized location dropdown component
  const LocationDropdown = ({
    value,
    onValueChange,
    placeholder,
    label,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    label: string;
  }) => {
    // Find the selected location object
    const selectedLocation = locations.find((loc) => loc._id === value);

    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <AsyncPaginate
            styles={{
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menuList: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            value={
              selectedLocation
                ? {
                    value: selectedLocation._id,
                    label: getStructuredAddress(selectedLocation).en,
                  }
                : null
            }
            maxMenuHeight={200}
            onChange={(option) => onValueChange(option?.value || "")}
            loadOptions={async (searchInputValue) => {
              const { data } = await locationServices.getLocations(1, 999999, {
                search: searchInputValue,
              });

              return {
                options: data.locations.map((location: any) => ({
                  value: location._id,
                  label: getStructuredAddress(location).en,
                })),
                hasMore: data.totalPages > 1,
              };
            }}
            placeholder={placeholder}
            isClearable
            isSearchable
            cacheUniqs={[locations.length]}
          />
        </FormControl>
      </FormItem>
    );
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
        <div className="border rounded-lg p-4 space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`locationPrices.${index}.location`}
              render={({ field }) => (
                <LocationDropdown
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select location"
                  label="Location"
                />
              )}
            />

            <FormField
              control={form.control}
              name={`locationPrices.${index}.price`}
              render={({ field }) => (
                <FormItem>
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

export default PerLocationEditPriceListSubActivity;
