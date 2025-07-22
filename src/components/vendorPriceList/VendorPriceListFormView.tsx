import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SubActivityForm } from "./SubActivityForm";
import { LocationPricesForm } from "./LocationPricesForm";
import { VendorPriceListFormProps } from "@/types/vendorPriceListTypes";

interface VendorPriceListFormViewProps extends VendorPriceListFormProps {
  form: any;
  subActivityFields: any[];
  subActivities: any[];
  subActivityPricingMethod: string;
  isLoading: boolean;
  addSubActivity: () => void;
  removeSubActivity: (index: number) => void;
  canRemoveSubActivity: boolean;
  handleSubmit: (data: any) => void;
}

export const VendorPriceListFormView = ({
  form,
  subActivityFields,
  subActivities,
  subActivityPricingMethod,
  isLoading,
  addSubActivity,
  removeSubActivity,
  canRemoveSubActivity,
  handleSubmit,
  onCancel,
  initialData,
}: VendorPriceListFormViewProps) => {
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sub Activity Prices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sub Activity Prices</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSubActivity}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sub Activity
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {subActivityFields.map((field, index) => (
              <div key={field.id}>
                <SubActivityForm
                  form={form}
                  index={index}
                  subActivities={subActivities}
                  onRemove={removeSubActivity}
                  canRemove={canRemoveSubActivity}
                />

                {/* Location Prices Section */}
                {subActivityPricingMethod === "perLocation" ||
                subActivityPricingMethod === "perTrip" ? (
                  <LocationPricesForm
                    form={form}
                    subActivityIndex={index}
                    pricingMethod={
                      subActivityPricingMethod as "perLocation" | "perTrip"
                    }
                  />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData
              ? "Update Price List"
              : "Create Price List"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
