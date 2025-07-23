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
import { cn } from "@/utils";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { LocationPricesFormProps } from "@/types/vendorPriceListTypes";

export const LocationPricesForm = ({
  form,
  locationPriceFields,
  addLocationPrice,
  removeLocationPrice,
}: LocationPricesFormProps & {
  locationPriceFields: any[];
  addLocationPrice: () => void;
  removeLocationPrice: (index: number) => void;
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
        <CardTitle>Location Prices</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLocationPrice}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location Price
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {locationPriceFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Location Price {index + 1}</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeLocationPrice(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`locationPrices.${index}.location`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
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
                name={`locationPrices.${index}.cost`}
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
