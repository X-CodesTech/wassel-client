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
  getDefaultLocationPrice,
  getDefaultTripLocationPrice,
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
      subActivity: "",
      pricingMethod: "perItem",
      cost: 0,
      locationPrices: [],
      tripLocationPrices: [],
    },
  });

  // Watch pricing method
  const pricingMethod = form.watch("pricingMethod");

  // Field array for location prices
  const {
    fields: locationPriceFields,
    append: appendLocationPrice,
    remove: removeLocationPrice,
  } = useFieldArray({
    control: form.control,
    name: "locationPrices",
  });

  // Field array for trip location prices
  const {
    fields: tripLocationPriceFields,
    append: appendTripLocationPrice,
    remove: removeTripLocationPrice,
  } = useFieldArray({
    control: form.control,
    name: "tripLocationPrices",
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
        pricingMethod
      );
      setSubActivities(data.data);
    } catch (error) {
      console.log(error);
    }
  }, [pricingMethod]);

  // Update sub activities when pricing method changes
  useEffect(() => {
    if (pricingMethod) {
      form.setValue("subActivity", "");
      getSubActivities();
    }
  }, [getSubActivities, pricingMethod, form]);

  // Add location price
  const addLocationPrice = () => {
    appendLocationPrice(getDefaultLocationPrice());
  };

  // Remove location price
  const removeLocationPriceHandler = (index: number) => {
    removeLocationPrice(index);
  };

  // Add trip location price
  const addTripLocationPrice = () => {
    appendTripLocationPrice(getDefaultTripLocationPrice());
  };

  // Remove trip location price
  const removeTripLocationPriceHandler = (index: number) => {
    removeTripLocationPrice(index);
  };

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
        subActivityPrices: [
          {
            _id: "",
            subActivity: data.subActivity as any,
            pricingMethod: data.pricingMethod,
            cost: data.cost,
            locationPrices:
              data.pricingMethod === "perLocation"
                ? (data.locationPrices || []).map((lp) => ({
                    ...lp,
                    pricingMethod: "perLocation" as const,
                  }))
                : [],
          },
        ] as any,
      };
      onSubmit(updateData);
    } else {
      // Create new price list - send simplified structure
      const createData = {
        vendorId: data.vendorId,
        subActivity: data.subActivity,
        pricingMethod: data.pricingMethod,
        cost: data.cost,
        locationPrices:
          data.pricingMethod === "perLocation"
            ? (data.locationPrices || []).map((lp) => ({
                ...lp,
                pricingMethod: "perLocation" as const,
              }))
            : [],
        tripLocationPrices:
          data.pricingMethod === "perTrip"
            ? (data.tripLocationPrices || []).map((lp) => ({
                ...lp,
                pricingMethod: "perTrip" as const,
              }))
            : [],
      };
      onSubmit(createData as any);
    }
  };

  return {
    // Form state
    form,
    subActivities,
    locationPriceFields,
    tripLocationPriceFields,
    pricingMethod,
    isLoading,

    // Actions
    handleSubmit: form.handleSubmit(handleSubmit),
    addLocationPrice,
    removeLocationPrice: removeLocationPriceHandler,
    addTripLocationPrice,
    removeTripLocationPrice: removeTripLocationPriceHandler,
    onCancel,

    // Form submission state
    isSubmitting: form.formState.isSubmitting,
  };
};
