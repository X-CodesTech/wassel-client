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
import { cn } from "@/utils";
import { SubActivityFormProps } from "@/types/vendorPriceListTypes";

export const SubActivityForm = ({
  form,
  index,
  subActivities,
  onRemove,
  canRemove,
}: SubActivityFormProps) => {
  const pricingMethod = form.watch(`subActivityPrices.${index}.pricingMethod`);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Sub Activity {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
          pricingMethod !== "perItem" && "md:grid-cols-2"
        )}
      >
        <FormField
          control={form.control}
          name={`subActivityPrices.${index}.pricingMethod`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing Method</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="perLocation">Per Location</SelectItem>
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
          name={`subActivityPrices.${index}.subActivity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Activity</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!pricingMethod}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub activity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subActivities.length > 0 &&
                    subActivities.map((activity) => (
                      <SelectItem key={activity._id} value={activity._id || ""}>
                        {activity.portalItemNameEn}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {pricingMethod === "perItem" ? (
          <FormField
            control={form.control}
            name={`subActivityPrices.${index}.cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Cost</FormLabel>
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
        ) : null}
      </div>
    </div>
  );
};
