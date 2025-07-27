import { AsyncLocationSelect } from "@/components/ui/async-location-select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { formSchema, TFormSchema } from "./validation";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import subActivityServices from "@/services/subActivityServices";
import { SubActivityResponse } from "@/types/types";
import { actAddCustomerPriceListSubActivity } from "@/store/customers";
import { toast } from "@/hooks/use-toast";

type TAddCustomerDetailsSubActivityDialog = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
};

const AddCustomerDetailsSubActivityDialog = ({
  open,
  onOpenChange,
  priceListId,
}: TAddCustomerDetailsSubActivityDialog) => {
  const dispatch = useAppDispatch();
  const { loading: addSubActivityLoading } = useAppSelector(
    (state) => state.customers
  );

  const [isLoadingSubActivities, setIsLoadingSubActivities] = useState(false);
  const [subActivities, setSubActivities] = useState<
    SubActivityResponse["data"]
  >([]);

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subActivity: "",
      pricingMethod: "perItem" as const,
      basePrice: 0,
    },
    mode: "all",
  });

  const pricingMethod = form.watch("pricingMethod");
  const selectedSubActivity = form.watch("subActivity");
  const locationPrices = form.watch("locationPrices");
  const {
    fields: locationPriceFields,
    append: appendLocationPrice,
    remove: removeLocationPrice,
  } = useFieldArray({
    control: form.control,
    name: "locationPrices",
  });

  // Fetch subActivities when pricing method changes
  useEffect(() => {
    const fetchSubActivities = async () => {
      if (!pricingMethod) return;

      setIsLoadingSubActivities(true);
      try {
        const response =
          await subActivityServices.getSubActivityByPricingMethod(
            pricingMethod
          );
        if (response.data.success) {
          setSubActivities(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching sub activities:", error);
        setSubActivities([]);
      } finally {
        setIsLoadingSubActivities(false);
      }
    };

    fetchSubActivities();
  }, [pricingMethod]);

  // Reset location prices and sub activity when pricing method changes
  useEffect(() => {
    // Reset sub activity when pricing method changes
    form.setValue("subActivity", "");

    // Reset form based on new pricing method to match the discriminated union schema
    if (pricingMethod === "perItem") {
      // perItem should only have basePrice, no locationPrices
      form.setValue("basePrice", 0);
      // Remove locationPrices field entirely for perItem
      form.unregister("locationPrices");
    } else if (pricingMethod === "perLocation") {
      // perLocation should have locationPrices with location field
      form.setValue("locationPrices", [
        { location: "", price: 0, pricingMethod: "perLocation" as const },
      ]);
      // Remove basePrice field for perLocation
      form.unregister("basePrice");
    } else if (pricingMethod === "perTrip") {
      // perTrip should have locationPrices with fromLocation and toLocation fields
      form.setValue("locationPrices", [
        {
          fromLocation: "",
          toLocation: "",
          price: 0,
          pricingMethod: "perTrip" as const,
        },
      ]);
      // Remove basePrice field for perTrip
      form.unregister("basePrice");
    }
  }, [pricingMethod, form]);

  const handleSubmit = (data: TFormSchema) => {
    // Prepare the data based on pricing method
    console.log(data);

    const submitData: any = {
      pricingMethod: data.pricingMethod,
      priceListId: priceListId || "",
      subActivityId: data.subActivity,
    };

    // Add pricing method specific data
    if (data.pricingMethod === "perItem") {
      submitData.basePrice = data.basePrice;
    } else if (
      data.pricingMethod === "perLocation" ||
      data.pricingMethod === "perTrip"
    ) {
      submitData.locationPrices = data.locationPrices;
    }

    dispatch(actAddCustomerPriceListSubActivity(submitData))
      .unwrap()
      .then((response) => {
        if (response._id) {
          toast({
            title: "Success",
            description: "Sub-activity added to price list successfully",
          });
          onOpenChange(false);
          // Reset form
          form.reset();
        }
      })
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
            description: "Failed to add sub activity to price list",
            variant: "destructive",
          });
        }
      });
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(handleSubmit);

  const addLocationPrice = () => {
    if (pricingMethod === "perLocation") {
      appendLocationPrice({
        location: "",
        pricingMethod: "perLocation" as const,
        price: 0,
      });
    } else if (pricingMethod === "perTrip") {
      appendLocationPrice({
        fromLocation: "",
        toLocation: "",
        pricingMethod: "perTrip" as const,
        price: 0,
      });
    }
    form.trigger();
  };

  // Helper function to check if location is selected for perLocation pricing
  const isLocationSelected = (index: number) => {
    if (!locationPrices || !locationPrices[index]) return false;
    const item = locationPrices[index];
    if ("location" in item) {
      return !!item.location;
    }
    return false;
  };

  // Helper function to check if both locations are selected for perTrip pricing
  const isTripLocationsSelected = (index: number) => {
    if (!locationPrices || !locationPrices[index]) return false;
    const item = locationPrices[index];
    if ("fromLocation" in item && "toLocation" in item) {
      return !!item.fromLocation && !!item.toLocation;
    }
    return false;
  };

  const isFormValid =
    Object.keys(form.formState.errors).length === 0 && form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Sub-Activity Price List</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Form {...form}>
            <div
              className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-4 items-end",
                pricingMethod === "perItem" && "md:grid-cols-3",
                pricingMethod === "perLocation" && "md:grid-cols-2",
                pricingMethod === "perTrip" && "md:grid-cols-2"
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
                        <SelectItem value="perLocation">
                          Per Location
                        </SelectItem>
                        <SelectItem value="perItem">Per Item</SelectItem>
                        <SelectItem value="perTrip">Per Trip</SelectItem>
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
                    <FormLabel className="flex items-center gap-1">
                      Sub Activity
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!pricingMethod || isLoadingSubActivities}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingSubActivities
                                ? "Loading..."
                                : "Select sub activity"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subActivities.length > 0 &&
                          subActivities.map((activity) => (
                            <SelectItem
                              key={activity._id}
                              value={activity._id || ""}
                            >
                              {activity.portalItemNameEn}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {pricingMethod === "perItem" && (
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
                          {...field}
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
              )}
            </div>

            {/* Location Prices Section */}
            {(pricingMethod === "perLocation" || pricingMethod === "perTrip") &&
              selectedSubActivity && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {pricingMethod === "perLocation"
                        ? "Location Prices"
                        : "Trip Location Prices"}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        !isFormValid || addSubActivityLoading === "pending"
                      }
                      onClick={addLocationPrice}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add{" "}
                      {pricingMethod === "perLocation" ? "Location" : "Trip"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {locationPriceFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        {pricingMethod === "perLocation" ? (
                          <>
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
                                        if (
                                          document.activeElement instanceof
                                          HTMLElement
                                        ) {
                                          document.activeElement.blur();
                                        }
                                      }}
                                      placeholder="Select location"
                                      useAddressString={true}
                                    />
                                  </FormControl>
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
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
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
                          </>
                        ) : (
                          <>
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
                                        if (
                                          document.activeElement instanceof
                                          HTMLElement
                                        ) {
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
                                        if (
                                          document.activeElement instanceof
                                          HTMLElement
                                        ) {
                                          document.activeElement.blur();
                                        }
                                      }}
                                      placeholder="Select to location"
                                      useAddressString={true}
                                    />
                                  </FormControl>
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
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      disabled={!isTripLocationsSelected(index)}
                                      onFocus={(e) => {
                                        if (!isTripLocationsSelected(index)) {
                                          e.target.blur();
                                        }
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </>
                        )}
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
              )}
          </Form>
        </DialogDescription>
        <DialogFooter>
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || addSubActivityLoading === "pending"}
          >
            {addSubActivityLoading === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDetailsSubActivityDialog;
