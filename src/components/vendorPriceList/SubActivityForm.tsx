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
import { cn } from "@/utils";
import { SubActivityFormProps } from "@/types/vendorPriceListTypes";

export const SubActivityForm = ({
  form,
  subActivities,
}: SubActivityFormProps) => {
  const pricingMethod = form.watch("pricingMethod");

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <h4 className="font-medium">Sub Activity Details</h4>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
          pricingMethod !== "perItem" && "md:grid-cols-2"
        )}
      >
        <FormField
          control={form.control}
          name="pricingMethod"
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
          name="subActivity"
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
            name="cost"
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
