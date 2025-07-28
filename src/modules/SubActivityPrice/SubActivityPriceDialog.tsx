import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Loader2, PlusIcon, TrashIcon } from "lucide-react";
import LocationSelect from "./LocationSelect";
import { TLoading } from "@/types";
import { TFormSchema, formSchema } from "./validation";
import { PRICING_METHODS } from "@/utils/constants";

// Define the interface for sub-activity response
interface ISubActivityByPricingMethod {
  success: boolean;
  data: Array<{
    _id: string;
    portalItemNameEn: string;
    [key: string]: any;
  }>;
}

type TSubActivityPriceDialog = {
  dialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogDescription: string;
  subActivityId: string;
  defaultValues?: TFormSchema;
  onSubmit?: (data: TFormSchema) => void;
};

const SubActivityPriceDialog = ({
  dialogOpen,
  onOpenChange,
  dialogTitle,
  dialogDescription,
  defaultValues,
  onSubmit = () => {},
}: TSubActivityPriceDialog) => {
  const [subActivities, setSubActivities] = useState<
    ISubActivityByPricingMethod["data"]
  >([]);
  const [loading, setLoading] = useState<TLoading>("idle");

  const form = useForm<TFormSchema>({
    defaultValues: defaultValues || {
      pricingMethod: "perItem",
      subActivity: "",
      basePrice: 0,
    },
    resolver: zodResolver(formSchema),
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

  const getSubActivitiesByPricingMethod = useCallback(async () => {
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
          variant: "destructive",
        });
      }
      setLoading("rejected");
    }
  }, [selectedPricingMethod]);

  const addLocationPriceHandler = () => {
    const newLocationPrice =
      selectedPricingMethod === "perLocation"
        ? {
            location: "",
            pricingMethod: "perLocation" as const,
            price: 0,
          }
        : {
            fromLocation: "",
            toLocation: "",
            pricingMethod: "perTrip" as const,
            price: 0,
          };

    appendLocationPrice(newLocationPrice);
    form.trigger("locationPrices");
  };

  const removeLocationPriceHandler = (index: number) => {
    removeLocationPrice(index);
    form.trigger("locationPrices");
  };

  const hasFormChanges = useMemo(() => {
    if (selectedPricingMethod === "perItem") {
      return form.getValues().basePrice !== defaultValues?.basePrice;
    }

    const currentValues = form.getValues();
    const originalValues = defaultValues;

    // Check if arrays have different lengths
    if (
      currentValues?.locationPrices?.length !==
      originalValues?.locationPrices?.length
    ) {
      return true;
    }

    // Check if any values are different
    return currentValues?.locationPrices?.some((currentTrip, index) => {
      const originalTrip = originalValues?.locationPrices[index];
      return (
        currentTrip.fromLocation !== originalTrip.fromLocation ||
        currentTrip.toLocation !== originalTrip.toLocation ||
        currentTrip.price !== originalTrip.price
      );
    });
  }, [form.watch(), defaultValues]);

  const submitFormHandler = form.handleSubmit(onSubmit, (errors) => {
    console.log(errors);
  });

  // Helper function to get location object for LocationSelect
  const getLocationObject = useCallback((locationId: string) => {
    if (!locationId) return undefined;

    // For now, return a basic object - in a real app you'd fetch from store
    // This should ideally come from a locations store or be passed as part of the editData
    return {
      _id: locationId,
      label: `Location ${locationId}`, // This would be the actual address
    };
  }, []);

  // Load locations when dialog opens with defaultValues
  useEffect(() => {
    if (dialogOpen && defaultValues) {
      // Ensure locations are loaded for edit mode
      // This would typically dispatch to load locations from the store
      // If we have locationPrices in defaultValues, we should ensure those locations are loaded
      if (
        defaultValues.pricingMethod !== "perItem" &&
        "locationPrices" in defaultValues
      ) {
        const locationIds = (defaultValues as any).locationPrices.flatMap(
          (item: any) => {
            if (item.location) return [item.location];
            if (item.fromLocation) return [item.fromLocation];
            if (item.toLocation) return [item.toLocation];
            return [];
          }
        );

        // Here you would dispatch to load specific locations if needed
      }
    }
  }, [dialogOpen, defaultValues]);

  useEffect(() => {
    if (selectedPricingMethod) {
      // Reset form with proper discriminated union structure
      if (selectedPricingMethod === "perItem") {
        form.reset({
          pricingMethod: "perItem",
          subActivity: "",
          basePrice: 0,
        } as TFormSchema);
      } else if (selectedPricingMethod === "perLocation") {
        form.reset({
          pricingMethod: "perLocation",
          subActivity: "",
          locationPrices: [],
        } as TFormSchema);
      } else if (selectedPricingMethod === "perTrip") {
        form.reset({
          pricingMethod: "perTrip",
          subActivity: "",
          locationPrices: [],
        } as TFormSchema);
      }
      getSubActivitiesByPricingMethod();
    }
  }, [getSubActivitiesByPricingMethod, selectedPricingMethod, form]);

  useEffect(() => {
    if (selectedSubActivity) {
      if (selectedPricingMethod === "perLocation") {
        form.setValue("locationPrices", [
          {
            location: "",
            pricingMethod: "perLocation" as const,
            price: 0,
          },
        ]);
      } else if (selectedPricingMethod === "perTrip") {
        form.setValue("locationPrices", [
          {
            fromLocation: "",
            toLocation: "",
            pricingMethod: "perTrip" as const,
            price: 0,
          },
        ]);
      }
      form.trigger("locationPrices");
    }
  }, [selectedSubActivity, selectedPricingMethod, form]);

  useEffect(() => {
    if (defaultValues) {
      // Handle form reset for edit mode with proper type handling
      const resetData: any = {
        pricingMethod: defaultValues.pricingMethod,
        subActivity: defaultValues.subActivity,
      };

      if (defaultValues.pricingMethod === "perItem") {
        resetData.basePrice = defaultValues.basePrice;
      } else if (
        defaultValues.pricingMethod === "perLocation" ||
        defaultValues.pricingMethod === "perTrip"
      ) {
        resetData.locationPrices = defaultValues.locationPrices;
      }

      form.reset(resetData);
    }
  }, [defaultValues, form]);

  const isFormValid = form.formState.isValid;

  const addLocationButtonDisabled = useMemo(
    () => loading === "pending" || !isFormValid || !selectedSubActivity,
    [loading, isFormValid, selectedSubActivity]
  );

  const submitButtonDisabled = useMemo(
    () => loading === "pending" || !hasFormChanges || !isFormValid,
    [loading, hasFormChanges, isFormValid]
  );

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      disabled={!selectedPricingMethod || loading === "pending"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {loading === "pending" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : null}
                          <SelectValue placeholder="Select Sub Activity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subActivities?.map((subActivity) => (
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
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={field.value as number}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                        disabled={addLocationButtonDisabled}
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
                              defaultValues={getLocationObject(
                                (locationPrice as any).location
                              )}
                            />
                            <div className="flex flex-1 items-end gap-2">
                              <FormField
                                control={form.control}
                                name={`locationPrices.${idx}.price`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col h-full w-full">
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={field.value as number}
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
                              {locationPriceFields.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    removeLocationPriceHandler(idx)
                                  }
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
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
                              defaultValues={getLocationObject(
                                (locationPrice as any).fromLocation
                              )}
                            />
                            <LocationSelect
                              key={idx}
                              form={form}
                              name={`locationPrices.${idx}.toLocation`}
                              label={"To Location"}
                              defaultValues={getLocationObject(
                                (locationPrice as any).toLocation
                              )}
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
                                        value={field.value as number}
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
                                  </FormItem>
                                )}
                              />
                              {locationPriceFields.length > 1 && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    removeLocationPriceHandler(idx)
                                  }
                                >
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      )}
                  </div>
                )
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitButtonDisabled}
                onClick={submitFormHandler}
              >
                {loading === "pending" ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubActivityPriceDialog;
