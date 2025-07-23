import { VendorPriceListFormProps } from "@/types/vendorPriceListTypes";
import { useVendorPriceListForm } from "@/hooks/useVendorPriceListForm";
import { VendorPriceListFormView } from "./VendorPriceListFormView";

export const VendorPriceListForm = (props: VendorPriceListFormProps) => {
  const {
    form,
    subActivities,
    locationPriceFields,
    pricingMethod,
    isLoading,
    addLocationPrice,
    removeLocationPrice,
    handleSubmit,
    onCancel,
  } = useVendorPriceListForm(props);

  return (
    <VendorPriceListFormView
      {...props}
      form={form}
      subActivities={subActivities}
      locationPriceFields={locationPriceFields}
      pricingMethod={pricingMethod}
      isLoading={isLoading}
      addLocationPrice={addLocationPrice}
      removeLocationPrice={removeLocationPrice}
      handleSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default VendorPriceListForm;
