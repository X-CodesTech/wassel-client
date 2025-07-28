import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { cn } from "@/utils";
import { PlusIcon, TrashIcon } from "lucide-react";
import LocationSelect from "./LocationSelect";
import { PRICING_METHODS } from "@/utils/constants";
import type { FormSchemaType } from "./validation";
import { useSubActivityPriceDialog } from "@/hooks/useSubActivityPriceDialog";
import { getStructuredAddress } from "@/utils/getStructuredAddress";

// Define LocationObject type locally to match LocationSelect
type LocationObject = {
  _id: string;
  label: string;
  [key: string]: any;
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
  // Use the custom hook to manage all dialog logic
  const {
    form,
    isFormValid,
    handleSubmit,
    handleOpenChange,
    subActivities,
    subActivitiesLoading: loading,
    findLocationById,
    locationPriceFields,
    addLocationPriceHandler,
    removeLocationPriceHandler,
    selectedPricingMethod,
    selectedSubActivity,
  } = useSubActivityPriceDialog({
    userType,
    defaultValues,
    dialogOpen,
    onSubmit,
    onError,
    onOpenChange,
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
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
                                        (locationPrice as any)._originalLocation
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
                                onClick={() => removeLocationPriceHandler(idx)}
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
                                (locationPrice as any)._originalFromLocation &&
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
                                  : typeof (locationPrice as any).toLocation ===
                                    "string"
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
                                onClick={() => removeLocationPriceHandler(idx)}
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
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading === "pending"}
                onClick={handleSubmit}
              >
                {loading === "pending" ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};

export default SubActivityPriceDialog;
