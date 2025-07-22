import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { cn } from "@/utils";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import {
  SubActivityLocationPricesProps,
  getDefaultLocationPrice,
} from "@/types/vendorPriceListTypes";

export const LocationPricesForm = ({
  form,
  subActivityIndex,
  pricingMethod,
}: SubActivityLocationPricesProps) => {
  const { records: locations } = useAppSelector((state) => state.locations);

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({
    control: form.control,
    name: `subActivityPrices.${subActivityIndex}.locationPrices`,
  });

  const addLocation = () => {
    appendLocation(getDefaultLocationPrice(pricingMethod));
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Location Prices</h5>
        <Button type="button" variant="outline" size="sm" onClick={addLocation}>
          <Plus className="h-4 w-4 mr-2" />
          {pricingMethod === "perLocation"
            ? "Add Location Price"
            : "Add Trip Price"}
        </Button>
      </div>

      {locationFields.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No location prices configured
        </div>
      ) : (
        <div className="space-y-3">
          {locationFields.map((field, locIndex) => (
            <div key={field.id} className="border rounded p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  {pricingMethod === "perLocation" ? "Location" : "Trip"}{" "}
                  {locIndex + 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLocation(locIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div
                className={cn(
                  "grid gap-3",
                  pricingMethod === "perLocation"
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-3"
                )}
              >
                {pricingMethod === "perLocation" ? (
                  <>
                    <FormField
                      control={form.control}
                      name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.location`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem
                                  key={location._id}
                                  value={location._id}
                                >
                                  {`${getStructuredAddress(location).en}\n${
                                    getStructuredAddress(location).ar
                                  }`}
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
                      name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.cost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Cost</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : pricingMethod === "perTrip" ? (
                  <>
                    <FormField
                      control={form.control}
                      name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.fromLocation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            From Location
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="From location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem
                                  key={location._id}
                                  value={location._id}
                                >
                                  {location.area} - {location.city}
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
                      name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.toLocation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">To Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="To location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem
                                  key={location._id}
                                  value={location._id}
                                >
                                  {location.area} - {location.city}
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
                      name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.cost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Cost</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
