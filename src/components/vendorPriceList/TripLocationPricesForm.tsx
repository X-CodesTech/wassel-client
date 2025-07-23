import React from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations/act";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { TripLocationPricesFormProps } from "@/types/vendorPriceListTypes";

export const TripLocationPricesForm = ({
  form,
  tripLocationPriceFields,
  addTripLocationPrice,
  removeTripLocationPrice,
}: TripLocationPricesFormProps & {
  tripLocationPriceFields: any[];
  addTripLocationPrice: () => void;
  removeTripLocationPrice: (index: number) => void;
}) => {
  const dispatch = useAppDispatch();
  const { records: locations } = useAppSelector((state) => state.locations);

  // Load locations on mount
  React.useEffect(() => {
    dispatch(actGetLocations({ filters: {}, page: 1, limit: 999999 }));
  }, [dispatch]);

  const formatAddress = (location: any) => {
    const address = getStructuredAddress(location);
    return `${address.en} - ${address.ar}`;
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trip Location Prices</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTripLocationPrice}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trip Location Price
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {tripLocationPriceFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Trip Location Price {index + 1}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeTripLocationPrice(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`tripLocationPrices.${index}.fromLocation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select from location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.length > 0 &&
                          locations.map((location) => (
                            <SelectItem
                              key={location._id}
                              value={location._id || ""}
                            >
                              {formatAddress(location)}
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
                name={`tripLocationPrices.${index}.toLocation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select to location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.length > 0 &&
                          locations.map((location) => (
                            <SelectItem
                              key={location._id}
                              value={location._id || ""}
                            >
                              {formatAddress(location)}
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
                name={`tripLocationPrices.${index}.cost`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
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
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
