import { VendorPriceListFormProps } from "@/types/vendorPriceListTypes";
import { useVendorPriceListForm } from "@/hooks/useVendorPriceListForm";
import { VendorPriceListFormView } from "./VendorPriceListFormView";

export const VendorPriceListForm = (props: VendorPriceListFormProps) => {
  const {
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
  } = useVendorPriceListForm(props);

  return (
    <VendorPriceListFormView
      {...props}
      form={form}
      subActivityFields={subActivityFields}
      subActivities={subActivities}
      subActivityPricingMethod={subActivityPricingMethod}
      isLoading={isLoading}
      addSubActivity={addSubActivity}
      removeSubActivity={removeSubActivity}
      canRemoveSubActivity={canRemoveSubActivity}
      handleSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default VendorPriceListForm;
