import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubActivityForm } from "./SubActivityForm";
import { LocationPricesForm } from "./LocationPricesForm";
import { TripLocationPricesForm } from "./TripLocationPricesForm";
import { VendorPriceListFormProps } from "@/types/vendorPriceListTypes";

interface VendorPriceListFormViewProps extends VendorPriceListFormProps {
  form: any;
  subActivities: any[];
  locationPriceFields: any[];
  tripLocationPriceFields: any[];
  pricingMethod: string;
  isLoading: boolean;
  addLocationPrice: () => void;
  removeLocationPrice: (index: number) => void;
  addTripLocationPrice: () => void;
  removeTripLocationPrice: (index: number) => void;
  handleSubmit: (data: any) => void;
}

export const VendorPriceListFormView = ({
  form,
  subActivities,
  locationPriceFields,
  tripLocationPriceFields,
  pricingMethod,
  isLoading,
  addLocationPrice,
  removeLocationPrice,
  addTripLocationPrice,
  removeTripLocationPrice,
  handleSubmit,
  onCancel,
  initialData,
}: VendorPriceListFormViewProps) => {
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sub Activity Price */}
        <Card>
          <CardHeader>
            <CardTitle>Sub Activity Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SubActivityForm form={form} subActivities={subActivities} />
          </CardContent>
        </Card>

        {/* Location Prices Section - Only show when pricingMethod is "perLocation" */}
        {pricingMethod === "perLocation" && (
          <LocationPricesForm
            form={form}
            locationPriceFields={locationPriceFields}
            addLocationPrice={addLocationPrice}
            removeLocationPrice={removeLocationPrice}
          />
        )}

        {/* Trip Location Prices Section - Only show when pricingMethod is "perTrip" */}
        {pricingMethod === "perTrip" && (
          <TripLocationPricesForm
            form={form}
            tripLocationPriceFields={tripLocationPriceFields}
            addTripLocationPrice={addTripLocationPrice}
            removeTripLocationPrice={removeTripLocationPrice}
          />
        )}

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
