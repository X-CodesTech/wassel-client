import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations/act";
import { subActivityServices } from "@/services";
import { SubActivityResponse } from "@/types/types";
import {
  VendorPriceListFormData,
  vendorPriceListSchema,
  VendorPriceListFormProps,
  PricingMethod,
  getDefaultSubActivityPrice,
  getDefaultLocationPrice,
} from "@/types/vendorPriceListTypes";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";

export const useVendorPriceListForm = ({
  vendorId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: VendorPriceListFormProps) => {
  const dispatch = useAppDispatch();
  const [subActivities, setSubActivities] = useState<
    SubActivityResponse["data"]
  >([]);

  // Initialize form
  const form = useForm<VendorPriceListFormData>({
    resolver: zodResolver(vendorPriceListSchema),
    defaultValues: {
      vendorId,
      subActivityPrices: [getDefaultSubActivityPrice()],
    },
  });

  // Watch pricing method for the first sub activity
  const subActivityPricingMethod = form.watch(
    "subActivityPrices.0.pricingMethod"
  );

  // Field arrays for dynamic form management
  const {
    fields: subActivityFields,
    append: appendSubActivity,
    remove: removeSubActivity,
  } = useFieldArray({
    control: form.control,
    name: "subActivityPrices",
  });

  // Load locations on mount
  useEffect(() => {
    dispatch(actGetLocations({ filters: {}, page: 1, limit: 999999 }));
  }, [dispatch]);

  // Fetch sub activities based on pricing method
  const getSubActivities = useCallback(async () => {
    setSubActivities([]);
    try {
      const { data } = await subActivityServices.getSubActivityByPricingMethod(
        subActivityPricingMethod
      );
      setSubActivities(data.data);
    } catch (error) {
      console.log(error);
    }
  }, [subActivityPricingMethod]);

  // Update sub activities when pricing method changes
  useEffect(() => {
    if (subActivityPricingMethod) {
      form.setValue("subActivityPrices.0.subActivity", "");
      getSubActivities();
    }
  }, [getSubActivities, subActivityPricingMethod, form]);

  // Auto-add location for perTrip pricing method
  useEffect(() => {
    if (subActivityPricingMethod === "perTrip") {
      const currentLocationPrices = form.getValues(
        "subActivityPrices.0.locationPrices"
      );
      if (!currentLocationPrices || currentLocationPrices.length === 0) {
        form.setValue("subActivityPrices.0.locationPrices", [
          getDefaultLocationPrice("perTrip"),
        ]);
      }
    }
  }, [subActivityPricingMethod, form]);

  // Form submission handler
  const handleSubmit = (data: VendorPriceListFormData) => {
    if (initialData?._id) {
      // Update existing price list
      const updateData: UpdateVendorPriceListRequest = {
        _id: initialData._id,
        vendorId: data.vendorId,
        name: initialData.name,
        nameAr: initialData.nameAr,
        description: initialData.description,
        descriptionAr: initialData.descriptionAr,
        effectiveFrom: initialData.effectiveFrom,
        effectiveTo: initialData.effectiveTo,
        isActive: initialData.isActive,
        subActivityPrices: data.subActivityPrices.map((subActivityPrice) => ({
          _id: "",
          subActivity: subActivityPrice.subActivity as any,
          pricingMethod: subActivityPrice.pricingMethod,
          cost: subActivityPrice.cost,
          locationPrices: subActivityPrice.locationPrices.map(
            (locationPrice) => ({
              _id: "",
              location: locationPrice.location as any,
              fromLocation: locationPrice.fromLocation as any,
              toLocation: locationPrice.toLocation as any,
              cost: locationPrice.cost,
              pricingMethod: locationPrice.pricingMethod,
            })
          ),
        })) as any,
      };
      onSubmit(updateData);
    } else {
      // Create new price list
      const createData: CreateVendorPriceListRequest = {
        vendorId: data.vendorId,
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        effectiveFrom: "",
        effectiveTo: "",
        isActive: true,
        subActivityPrices: data.subActivityPrices.map((subActivityPrice) => ({
          _id: "",
          subActivity: subActivityPrice.subActivity as any,
          pricingMethod: subActivityPrice.pricingMethod,
          cost: subActivityPrice.cost,
          locationPrices: subActivityPrice.locationPrices.map(
            (locationPrice) => ({
              _id: "",
              location: locationPrice.location as any,
              fromLocation: locationPrice.fromLocation as any,
              toLocation: locationPrice.toLocation as any,
              cost: locationPrice.cost,
              pricingMethod: locationPrice.pricingMethod,
            })
          ),
        })) as any,
      };
      onSubmit(createData);
    }
  };

  // Add new sub activity
  const addSubActivity = () => {
    appendSubActivity(getDefaultSubActivityPrice());
  };

  // Remove sub activity
  const handleRemoveSubActivity = (index: number) => {
    if (subActivityFields.length > 1) {
      removeSubActivity(index);
    }
  };

  // Check if sub activity can be removed
  const canRemoveSubActivity = subActivityFields.length > 1;

  return {
    // Form state
    form,
    subActivityFields,
    subActivities,
    subActivityPricingMethod,
    isLoading,

    // Actions
    handleSubmit: form.handleSubmit(handleSubmit),
    addSubActivity,
    removeSubActivity: handleRemoveSubActivity,
    canRemoveSubActivity,
    onCancel,

    // Form submission state
    isSubmitting: form.formState.isSubmitting,
  };
};
