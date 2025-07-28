import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCallback, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { useFieldArray, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast.ts";
import { subActivityServices } from "@/services";
import { axiosErrorHandler, cn } from "@/utils";
import { PlusIcon, TrashIcon } from "lucide-react";
import LocationSelect from "./LocationSelect";
import { TLoading } from "@/types";
import { createFormSchema } from "./validation";
import { PRICING_METHODS } from "@/utils/constants";
import type { FormSchemaType } from "./validation";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getStructuredAddress } from "@/utils/getStructuredAddress";

// Define LocationObject type locally to match LocationSelect
type LocationObject = {
  _id: string;
  label: string;
  [key: string]: any;
};

// Define the subactivity response type inline
type ISubActivityByPricingMethod = {
  success: boolean;
  data: Array<{
    _id: string;
    portalItemNameEn: string;
    [key: string]: any;
  }>;
};

type TSubActivityPriceDialog<T extends "customer" | "vendor" | "priceList"> = {
  dialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogDescription: string;
  subActivityId: string;
  userType: T;
  defaultValues?: FormSchemaType<T>;
  onSubmit?: (data: FormSchemaType<T>) => void;
  onError?: (error: any) => void;
};

const SubActivityPriceDialog = <T extends "customer" | "vendor" | "priceList">({
  dialogOpen,
  onOpenChange,
  dialogTitle,
  dialogDescription,
  defaultValues,
  onSubmit = () => {},
  onError = () => {},
  userType,
}: TSubActivityPriceDialog<T>) => {
  const formSchema = createFormSchema(userType);
  type FormSchema = FormSchemaType<T>; // Use the helper type

  const [subActivities, setSubActivities] = useState<
    ISubActivityByPricingMethod["data"]
  >([]);
  const [loading, setLoading] = useState<TLoading>("idle");

  // Get locations from store to find location objects
  const { records: locations } = useAppSelector((state) => state.locations);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    // Don't set defaultValues here - let it be handled by the useEffect
  });

  const {
    fields: locationPriceFields,
    remove: removeLocationPrice,
    append: appendLocationPrice,
  } = useFieldArray({
    control: form.control,
    name: "locationPrices",
  });

  const selectedPricingMethod = form.watch("pricingMethod");
  const selectedSubActivity = form.watch("subActivity");

  // Helper function to find location object by ID
  const findLocationById = (locationId: string): LocationObject | undefined => {
    if (!locationId || !locations.length) return undefined;
    const location = locations.find((loc: any) => loc._id === locationId);
    return location
      ? {
          ...location,
          label: getStructuredAddress(location).en,
        }
      : undefined;
  };

  // Load locations when dialog opens
  useEffect(() => {
    if (dialogOpen && locations.length === 0) {
      // Dispatch action to load locations if not already loaded
      console.log("Loading locations for dialog...");
      // You might need to dispatch an action here to load locations
      // dispatch(actGetLocations({ page: 1, limit: 999999, filters: {} }));
    }
  }, [dialogOpen, locations.length]);

  const getSubActivitiesByPricingMethod = useCallback(async () => {
    // Only clear subActivity and locationPrices when changing pricing method
    // Don't reset the entire form to preserve pricingMethod
    form.setValue("subActivity", "");
    if (selectedPricingMethod !== "perItem") {
      form.setValue("locationPrices", []);
    }

    setLoading("pending");
    try {
      const { data } = await subActivityServices.getSubActivityByPricingMethod(
        selectedPricingMethod
      );
      setSubActivities(data.data);
      setLoading("fulfilled");
      return data;
    } catch (error) {
      const apiError = axiosErrorHandler(error);
      let errorMessage = apiError?.message || apiError;

      if (apiError) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
        });
      }
      setLoading("rejected");
    }
  }, [selectedPricingMethod, form]);

  const addLocationPriceHandler = () => {
    if (selectedPricingMethod === "perLocation") {
      appendLocationPrice({
        location: "",
        price: 0,
        pricingMethod: "perLocation" as const,
      });
    } else if (selectedPricingMethod === "perTrip") {
      appendLocationPrice({
        fromLocation: "",
        toLocation: "",
        cost: 0,
        pricingMethod: "perTrip" as const,
      });
    }
    form.trigger("locationPrices");
  };

  const removeLocationPriceHandler = (index: number) => {
    removeLocationPrice(index);
    form.trigger("locationPrices");
  };

  useEffect(() => {
    if (selectedPricingMethod) {
      getSubActivitiesByPricingMethod();
    }
  }, [getSubActivitiesByPricingMethod, selectedPricingMethod]);

  useEffect(() => {
    if (selectedSubActivity && !defaultValues) {
      // Set initial locationPrices based on pricing method
      if (selectedPricingMethod === "perLocation") {
        form.setValue("locationPrices", [
          {
            location: "",
            price: 0,
            pricingMethod: "perLocation" as const,
          },
        ]);
      } else if (selectedPricingMethod === "perTrip") {
        form.setValue("locationPrices", [
          {
            fromLocation: "",
            toLocation: "",
            cost: 0,
            pricingMethod: "perTrip" as const,
          },
        ]);
      }
      form.trigger("locationPrices");
    }
  }, [selectedSubActivity, defaultValues, form, selectedPricingMethod]);

  // Only reset form when defaultValues are provided (edit mode)
  useEffect(() => {
    if (defaultValues?.pricingMethod) {
      // First load the subActivities for the pricing method
      if (!subActivities.length) {
        setLoading("pending");
        subActivityServices
          .getSubActivityByPricingMethod(defaultValues.pricingMethod)
          .then(({ data }) => {
            setSubActivities(data.data);
            setLoading("fulfilled");
          })
          .catch(() => {
            setLoading("rejected");
          });
      }

      // Use proper type assertion based on pricing method
      if (defaultValues.pricingMethod === "perItem") {
        form.reset({
          pricingMethod: "perItem",
          subActivity: defaultValues.subActivity,
          [userType === "vendor" ? "cost" : "basePrice"]:
            (defaultValues as any)[
              userType === "vendor" ? "cost" : "basePrice"
            ] || 0,
        } as any);
      } else if (defaultValues.pricingMethod === "perLocation") {
        form.reset({
          pricingMethod: "perLocation",
          subActivity: defaultValues.subActivity,
          locationPrices:
            (defaultValues as any).locationPrices?.map((lp: any) => ({
              location: lp.location?._id || lp.location, // Store ID for form value
              pricingMethod: "perLocation",
              price: lp.price || 0,
            })) || [],
        } as any);
      } else if (defaultValues.pricingMethod === "perTrip") {
        form.reset({
          pricingMethod: "perTrip",
          subActivity: defaultValues.subActivity,
          locationPrices:
            (defaultValues as any).locationPrices?.map((lp: any) => ({
              fromLocation: lp.fromLocation?._id || lp.fromLocation, // Store ID for form value
              toLocation: lp.toLocation?._id || lp.toLocation, // Store ID for form value
              pricingMethod: "perTrip",
              cost: lp.cost || lp.price || 0, // Handle both cost and price
            })) || [],
        } as any);
      }
    }
  }, [defaultValues, form, userType, subActivities.length]);

  // Set default pricing method to "perItem" in add mode
  useEffect(() => {
    if (!defaultValues && dialogOpen) {
      form.setValue("pricingMethod", "perItem");
    }
  }, [defaultValues, dialogOpen, form]);

  const isFormValid = form.formState.isValid;

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            form.reset();
          }
          onOpenChange(open);
        }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => onError?.(error))}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </DialogHeader>
              <div
                className={cn(
                  "grid gap-4",
                  selectedPricingMethod !== "perItem"
                    ? "grid grid-cols-2"
                    : "grid-cols-3"
                )}
              >
                <FormField
                  control={form.control}
                  name="pricingMethod"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Pricing Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!defaultValues} // Disable in edit mode
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRICING_METHODS.map((pricingMethod) => (
                            <SelectItem
                              key={pricingMethod._id}
                              value={pricingMethod.value}
                            >
                              {pricingMethod.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subActivity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Sub Activity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={
                          !!defaultValues ||
                          !selectedPricingMethod ||
                          loading === "pending"
                        } // Disable in edit mode
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Sub Activity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subActivities?.map((subActivity: any) => (
                            <SelectItem
                              key={subActivity._id}
                              value={subActivity._id}
                            >
                              {subActivity?.portalItemNameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedPricingMethod === "perItem" ? (
                  <FormField
                    control={form.control}
                    name={userType === "vendor" ? "cost" : ("basePrice" as any)}
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            disabled={!selectedSubActivity}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  selectedSubActivity && (
                    <div className="flex flex-col h-full w-full col-span-2 gap-4 my-4">
                      <div className="flex items-center justify-between">
                        <h3>
                          {selectedPricingMethod === "perLocation"
                            ? "Locations"
                            : "Trip Locations"}
                        </h3>
                        <Button
                          onClick={addLocationPriceHandler}
                          disabled={loading === "pending"}
                        >
                          <PlusIcon />
                          Add{" "}
                          {selectedPricingMethod === "perLocation"
                            ? "Location"
                            : "Trip"}
                        </Button>
                      </div>
                      {locationPriceFields.length > 0 &&
                        locationPriceFields.map((locationPrice, idx) =>
                          selectedPricingMethod === "perLocation" ? (
                            <div key={idx} className="grid grid-cols-2 gap-4">
                              <LocationSelect
                                key={idx}
                                form={form}
                                name={`locationPrices.${idx}.location`}
                                label={"Location"}
                                defaultValues={
                                  // First try to use the original location object with label
                                  (locationPrice as any)._originalLocation &&
                                  typeof (locationPrice as any)
                                    ._originalLocation === "object"
                                    ? {
                                        ...(locationPrice as any)
                                          ._originalLocation,
                                        label: getStructuredAddress(
                                          (locationPrice as any)
                                            ._originalLocation
                                        ).en,
                                      }
                                    : // Then try to find the location by ID from store
                                    typeof (locationPrice as any).location ===
                                      "string"
                                    ? findLocationById(
                                        (locationPrice as any).location
                                      )
                                    : // Finally, fallback to treating it as a location object
                                      ((locationPrice as any)
                                        .location as LocationObject)
                                }
                              />
                              <div className="flex flex-1 items-end gap-2">
                                <FormField
                                  control={form.control}
                                  name={`locationPrices.${idx}.price`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col h-full">
                                      <FormLabel>Price</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          disabled={
                                            !selectedSubActivity ||
                                            loading === "pending"
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    removeLocationPriceHandler(idx)
                                  }
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={idx}
                              className="grid grid-cols-3 gap-2 items-end justify-end"
                            >
                              <LocationSelect
                                key={idx}
                                form={form}
                                name={`locationPrices.${idx}.fromLocation`}
                                label={"From Location"}
                                defaultValues={
                                  (locationPrice as any)
                                    ._originalFromLocation &&
                                  typeof (locationPrice as any)
                                    ._originalFromLocation === "object"
                                    ? {
                                        ...(locationPrice as any)
                                          ._originalFromLocation,
                                        label: getStructuredAddress(
                                          (locationPrice as any)
                                            ._originalFromLocation
                                        ).en,
                                      }
                                    : typeof (locationPrice as any)
                                        .fromLocation === "string"
                                    ? findLocationById(
                                        (locationPrice as any).fromLocation
                                      )
                                    : ((locationPrice as any)
                                        .fromLocation as LocationObject)
                                }
                              />
                              <LocationSelect
                                key={idx}
                                form={form}
                                name={`locationPrices.${idx}.toLocation`}
                                label={"To Location"}
                                defaultValues={
                                  (locationPrice as any)._originalToLocation &&
                                  typeof (locationPrice as any)
                                    ._originalToLocation === "object"
                                    ? {
                                        ...(locationPrice as any)
                                          ._originalToLocation,
                                        label: getStructuredAddress(
                                          (locationPrice as any)
                                            ._originalToLocation
                                        ).en,
                                      }
                                    : typeof (locationPrice as any)
                                        .toLocation === "string"
                                    ? findLocationById(
                                        (locationPrice as any).toLocation
                                      )
                                    : ((locationPrice as any)
                                        .toLocation as LocationObject)
                                }
                              />
                              <div className="flex flex-1 items-end gap-2">
                                <FormField
                                  control={form.control}
                                  name={`locationPrices.${idx}.cost`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col h-full">
                                      <FormLabel>Price</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          disabled={
                                            !selectedSubActivity ||
                                            loading === "pending"
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    removeLocationPriceHandler(idx)
                                  }
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  )
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading === "pending"}
                  onClick={() => {
                    console.log("Form errors:", form.formState.errors);
                    console.log("Form values:", form.getValues());
                    console.log("Form valid:", form.formState.isValid);
                    form.handleSubmit(onSubmit, (error) => {
                      console.log("Validation failed:", error);
                      onError?.(error);
                    })();
                  }}
                >
                  {loading === "pending" ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Form>
      </Dialog>
    </>
  );
};

export default SubActivityPriceDialog;
