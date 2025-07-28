import { useCallback, useEffect, useState, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { subActivityServices } from "@/services";
import { actGetLocations } from "@/store/locations";
import { axiosErrorHandler } from "@/utils";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { TFormSchema, formSchema } from "@/modules/SubActivityPrice/validation";
import { TLoading } from "@/types";

type LocationObject = {
  _id: string;
  label: string;
  [key: string]: any;
};

type ISubActivityByPricingMethod = {
  success: boolean;
  data: Array<{
    _id: string;
    portalItemNameEn: string;
    [key: string]: any;
  }>;
};

interface UseSubActivityPriceDialogOptions {
  defaultValues?: any; // Accept any type since we transform it internally
  dialogOpen: boolean;
  onSubmit?: (data: TFormSchema) => void;
  onError?: (error: any) => void;
  onOpenChange: (open: boolean) => void;
}

export const useSubActivityPriceDialog = ({
  defaultValues,
  dialogOpen,
  onSubmit = () => {},
  onError = () => {},
  onOpenChange,
}: UseSubActivityPriceDialogOptions) => {
  const dispatch = useAppDispatch();

  // State
  const [subActivities, setSubActivities] = useState<
    ISubActivityByPricingMethod["data"]
  >([]);
  const [loading, setLoading] = useState<TLoading>("idle");

  // Get locations from store
  const { records: locations } = useAppSelector((state) => state.locations);

  // Transform function for edit mode data
  const transformSelectedData = useCallback((selectedData: any) => {
    if (!selectedData) return undefined;

    if (selectedData?.pricingMethod === "perTrip") {
      return {
        pricingMethod: selectedData?.pricingMethod,
        subActivity:
          typeof selectedData?.subActivity === "string"
            ? selectedData?.subActivity
            : selectedData?.subActivity?._id,
        locationPrices:
          selectedData?.locationPrices?.map((lp: any) => ({
            fromLocation: lp.fromLocation?._id || lp.fromLocation,
            toLocation: lp.toLocation?._id || lp.toLocation,
            pricingMethod: "perTrip" as const,
            price: lp.price || lp.cost || 0,
            _originalFromLocation: lp.fromLocation,
            _originalToLocation: lp.toLocation,
          })) || [],
      };
    }
    if (selectedData?.pricingMethod === "perLocation") {
      return {
        pricingMethod: selectedData?.pricingMethod,
        subActivity:
          typeof selectedData?.subActivity === "string"
            ? selectedData?.subActivity
            : selectedData?.subActivity?._id,
        locationPrices:
          selectedData?.locationPrices?.map((lp: any) => ({
            location: lp.location?._id || lp.location,
            pricingMethod: "perLocation" as const,
            price: lp.price || 0,
            _originalLocation: lp.location,
          })) || [],
      };
    }

    return {
      pricingMethod: selectedData?.pricingMethod,
      subActivity:
        typeof selectedData?.subActivity === "string"
          ? selectedData?.subActivity
          : selectedData?.subActivity?._id,
      basePrice: selectedData?.basePrice || 0,
    };
  }, []);

  // Transform defaultValues if they're raw data (not in form schema format)
  const transformedDefaultValues = useMemo(() => {
    if (!defaultValues || defaultValues === null) return undefined;
    return transformSelectedData(defaultValues);
  }, [defaultValues, transformSelectedData]);

  // Form setup
  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
  });

  const {
    fields: locationPriceFields,
    remove: removeLocationPrice,
    append: appendLocationPrice,
  } = useFieldArray({
    control: form.control,
    name: "locationPrices",
  });

  // Computed values
  const selectedPricingMethod = form.watch("pricingMethod");
  const selectedSubActivity = form.watch("subActivity");
  const isFormValid = form.formState.isValid;

  // Helper function to find location object by ID
  const findLocationById = useCallback(
    (locationId: string): LocationObject | undefined => {
      if (!locationId || !locations.length) return undefined;
      const location = locations.find((loc: any) => loc._id === locationId);
      return location
        ? {
            ...location,
            label: getStructuredAddress(location).en,
          }
        : undefined;
    },
    [locations]
  );

  // Load sub activities by pricing method
  const getSubActivitiesByPricingMethod = useCallback(async () => {
    form.setValue("subActivity", "");
    if (selectedPricingMethod !== "perItem") {
      form.setValue("locationPrices", []);
    }

    setLoading("pending");
    try {
      const { data } = await subActivityServices.getSubActivityByPricingMethod(
        selectedPricingMethod
      );
      setSubActivities(data.data);
      setLoading("fulfilled");
      return data;
    } catch (error) {
      const apiError = axiosErrorHandler(error);
      let errorMessage = apiError?.message || apiError;

      if (apiError) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
        });
      }
      setLoading("rejected");
    }
  }, [selectedPricingMethod, form]);

  // Add location price handler
  const addLocationPriceHandler = useCallback(() => {
    if (selectedPricingMethod === "perLocation") {
      appendLocationPrice({
        location: "",
        price: 0,
        pricingMethod: "perLocation" as const,
      });
    } else if (selectedPricingMethod === "perTrip") {
      appendLocationPrice({
        fromLocation: "",
        toLocation: "",
        price: 0,
        pricingMethod: "perTrip" as const,
      });
    }
    form.trigger("locationPrices");
  }, [selectedPricingMethod, appendLocationPrice, form]);

  // Remove location price handler
  const removeLocationPriceHandler = useCallback(
    (index: number) => {
      removeLocationPrice(index);
      form.trigger("locationPrices");
    },
    [removeLocationPrice, form]
  );

  // Handle form submission
  const handleSubmit = useCallback(() => {
    form.handleSubmit(onSubmit, (error) => {
      onError?.(error);
    })();
  }, [form, onSubmit, onError]);

  // Handle dialog open/close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        form.reset();
      }
      onOpenChange(open);
    },
    [form, onOpenChange]
  );

  // Initialize locations when dialog opens
  useEffect(() => {
    if (dialogOpen && locations.length === 0) {
      dispatch(actGetLocations({ page: 1, limit: 999999, filters: {} }));
    }
  }, [dialogOpen, locations.length, dispatch]);

  // Load sub activities when pricing method changes
  useEffect(() => {
    if (selectedPricingMethod) {
      getSubActivitiesByPricingMethod();
    }
  }, [getSubActivitiesByPricingMethod, selectedPricingMethod]);

  // Set initial location prices when sub activity is selected (add mode)
  useEffect(() => {
    if (selectedSubActivity && !transformedDefaultValues) {
      if (selectedPricingMethod === "perLocation") {
        form.setValue("locationPrices", [
          {
            location: "",
            price: 0,
            pricingMethod: "perLocation" as const,
          },
        ]);
      } else if (selectedPricingMethod === "perTrip") {
        form.setValue("locationPrices", [
          {
            fromLocation: "",
            toLocation: "",
            price: 0,
            pricingMethod: "perTrip" as const,
          },
        ]);
      }
      form.trigger("locationPrices");
    }
  }, [
    selectedSubActivity,
    transformedDefaultValues,
    form,
    selectedPricingMethod,
  ]);

  // Handle form reset for edit mode
  useEffect(() => {
    if (transformedDefaultValues?.pricingMethod) {
      if (!subActivities.length) {
        setLoading("pending");
        subActivityServices
          .getSubActivityByPricingMethod(transformedDefaultValues.pricingMethod)
          .then(({ data }) => {
            setSubActivities(data.data);
            setLoading("fulfilled");
          })
          .catch(() => {
            setLoading("rejected");
          });
      }

      if (transformedDefaultValues.pricingMethod === "perItem") {
        form.reset({
          pricingMethod: "perItem",
          subActivity: transformedDefaultValues.subActivity,
          basePrice: transformedDefaultValues.basePrice || 0,
        } as any);
      } else if (transformedDefaultValues.pricingMethod === "perLocation") {
        form.reset({
          pricingMethod: "perLocation",
          subActivity: transformedDefaultValues.subActivity,
          locationPrices:
            (transformedDefaultValues as any).locationPrices?.map(
              (lp: any) => ({
                location: lp.location?._id || lp.location,
                pricingMethod: "perLocation",
                price: lp.price || 0,
              })
            ) || [],
        } as any);
      } else if (transformedDefaultValues.pricingMethod === "perTrip") {
        form.reset({
          pricingMethod: "perTrip",
          subActivity: transformedDefaultValues.subActivity,
          locationPrices:
            (transformedDefaultValues as any).locationPrices?.map(
              (lp: any) => ({
                fromLocation: lp.fromLocation?._id || lp.fromLocation,
                toLocation: lp.toLocation?._id || lp.toLocation,
                pricingMethod: "perTrip",
                cost: lp.cost || lp.price || 0,
              })
            ) || [],
        } as any);
      }
    }
  }, [transformedDefaultValues, form, subActivities.length]);

  // Set default pricing method for add mode
  useEffect(() => {
    if (!transformedDefaultValues && dialogOpen) {
      form.setValue("pricingMethod", "perItem");
    }
  }, [transformedDefaultValues, dialogOpen, form]);

  return {
    // Dialog props that can be spread to SubActivityPriceDialog
    dialogProps: {
      dialogOpen,
      onOpenChange: handleOpenChange,
      dialogTitle: transformedDefaultValues ? "Edit Item" : "Add Item",
      dialogDescription: transformedDefaultValues
        ? "Edit the selected item"
        : "Add an item to the price list",
      defaultValues: transformedDefaultValues,
      onSubmit,
      onError,
      subActivityId: "", // You can make this configurable if needed
    },

    // Internal state and methods (for advanced usage)
    form,
    isFormValid,
    handleSubmit,
    handleOpenChange,
    subActivities,
    subActivitiesLoading: loading,
    findLocationById,
    locationPriceFields,
    addLocationPriceHandler,
    removeLocationPriceHandler,
    selectedPricingMethod,
    selectedSubActivity,
    transformSelectedData,
    loading,
  };
};
