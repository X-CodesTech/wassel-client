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
import { SubActivityPrice } from "@/services/vendorServices";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actEditVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors/vendorsSlice";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils";
import { Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutoSizer, List } from "react-virtualized";
import { actGetLocations } from "@/store/locations";
import locationServices from "@/services/locationServices";

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
  const { records: locations } = useAppSelector((state) => state.locations);
  const { pagination } = useAppSelector((state) => state.locations);

  const vendorId = priceLists?.[0]?.vendor?._id || "";
  const vendorPriceListId = priceListId;
  const subActivityId = selectedSubActivityPrice.subActivity._id || "";

  // Performance optimization states
  const [searchTerm, setSearchTerm] = useState("");

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

  // Memoized filtered and paginated locations
  const filteredLocations = useMemo(() => {
    if (!searchTerm) return locations;

    return locations.filter((location) => {
      const address = getStructuredAddress(location).en.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return address.includes(searchLower);
    });
  }, [locations, searchTerm]);

  const paginatedLocations = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredLocations.slice(startIndex, endIndex);
  }, [filteredLocations, pagination.page, pagination.limit]);

  const totalPages = Math.ceil(filteredLocations.length / pagination.limit);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

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
            menuIsOpen
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menuList: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({ ...base, zIndex: 9999 }),
              option: (base) => ({ ...base, zIndex: 9999 }),
              input: (base) => ({ ...base, zIndex: 9999 }),
              singleValue: (base) => ({ ...base, zIndex: 9999 }),
              multiValue: (base) => ({ ...base, zIndex: 9999 }),
              multiValueLabel: (base) => ({ ...base, zIndex: 9999 }),
              multiValueRemove: (base) => ({ ...base, zIndex: 9999 }),
            }}
            value={
              selectedLocation
                ? {
                    value: selectedLocation._id,
                    label: getStructuredAddress(selectedLocation).en,
                  }
                : null
            }
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
  const rowRenderer = useCallback(
    ({
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
    },
    [
      locationPriceFields,
      selectedSubActivityPrice.locationPrices,
      removeLocationPrice,
      form.control,
    ]
  );

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
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowCount={locationPriceFields.length}
                  rowHeight={170} // Approximate height of each location item
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

export default PerLocationEditPriceCostList;
