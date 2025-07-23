import { VendorPriceListFormProps } from "@/types/vendorPriceListTypes";
import { useVendorPriceListForm } from "@/hooks/useVendorPriceListForm";
import { VendorPriceListFormView } from "./VendorPriceListFormView";

export const VendorPriceListForm = (props: VendorPriceListFormProps) => {
  const {
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
  } = useVendorPriceListForm(props);

  return (
    <VendorPriceListFormView
      {...props}
      form={form}
      subActivities={subActivities}
      locationPriceFields={locationPriceFields}
      tripLocationPriceFields={tripLocationPriceFields}
      pricingMethod={pricingMethod}
      isLoading={isLoading}
      addLocationPrice={addLocationPrice}
      removeLocationPrice={removeLocationPrice}
      addTripLocationPrice={addTripLocationPrice}
      removeTripLocationPrice={removeTripLocationPrice}
      handleSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default VendorPriceListForm;
