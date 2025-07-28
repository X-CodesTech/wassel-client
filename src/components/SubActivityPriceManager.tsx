import React, { useMemo, useState } from "react";
import SubActivityPriceDialog from "@/modules/SubActivityPrice/SubActivityPriceDialog";
import { useSubActivityPriceDialog } from "@/hooks/useSubActivityPriceDialog";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations";
import {
  actAddPriceListSubActivity,
  actUpdateSubActivityPrice,
} from "@/store/priceLists";
import { actGetCustomer, addPriceListSubActivity } from "@/store/customers";
import { toast } from "@/hooks/use-toast";
import { TLoading } from "@/types";
import {
  actAddVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors";
import { actEditVendorSubActivityPrice } from "@/store/vendors/vendorsSlice";

const updateBodyPasrer = (
  data: any,
  contextType: ContextType,
  isEdit: boolean = false
) => {
  switch (contextType) {
    case "vendor":
      switch (data.pricingMethod) {
        case "perItem":
          return isEdit
            ? {
                cost: data.basePrice,
              }
            : {
                subActivity: data.subActivity,
                cost: data.basePrice,
                pricingMethod: data.pricingMethod,
              };
        case "perTrip":
          return {
            subActivity: data.subActivity,
            pricingMethod: data.pricingMethod,
            locationPrices: data.locationPrices?.map((lp) => ({
              ...lp,
              fromLocation: lp.fromLocation,
              toLocation: lp.toLocation,
              cost: lp.price,
            })),
          };
        case "perLocation":
          return {
            subActivity: data.subActivity,
            pricingMethod: data.pricingMethod,
            locationPrices: data.locationPrices?.map((lp) => ({
              ...lp,
              fromLocation: lp.fromLocation,
              toLocation: lp.toLocation,
              cost: lp.price,
            })),
          };
        default:
          return {};
      }
    default:
      switch (data.pricingMethod) {
        case "perItem":
          return {
            basePrice: data.basePrice,
          };
        case "perTrip":
          return {
            locationPrices: data.locationPrices,
          };
        case "perLocation":
          return {
            locationPrices: data.locationPrices,
          };
        default:
          return {};
      }
  }
};

type ContextType = "customer" | "vendor" | "priceList";

interface SubActivityPriceManagerProps {
  contextType: ContextType;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  editData?: any;
  setEditData: (data: any) => void;
  dialogTitle: string;
  dialogDescription: string;

  customerId?: string;
  vendorId?: string;
  priceListId?: string;
  subActivityPriceId?: string;
}

const SubActivityPriceManager: React.FC<SubActivityPriceManagerProps> = ({
  contextType,
  isDialogOpen,
  setIsDialogOpen,
  editData,
  setEditData,
  dialogTitle,
  dialogDescription,
  customerId,
  vendorId,
  priceListId,
  subActivityPriceId,
}) => {
  const defaultValues = useMemo(() => {
    if (contextType === "vendor") {
      return {
        subActivity: editData?.subActivity,
        pricingMethod: editData?.pricingMethod || "perItem",
        locationPrices:
          editData?.locationPrices?.map((lp) => ({
            ...lp,
            fromLocation: lp.fromLocation,
            toLocation: lp.toLocation,
            price: lp.cost,
          })) || [],
        basePrice: editData?.cost || 0,
      };
    } else {
      return editData;
    }
  }, [contextType, editData]);

  const dispatch = useAppDispatch();
  const { selectedCustomer } = useAppSelector((state) => state.customers);
  customerId = selectedCustomer?._id || customerId || "";
  const [loading, setLoading] = useState<TLoading>("idle");

  React.useEffect(() => {
    if (isDialogOpen) {
      dispatch(actGetLocations({ page: 1, limit: 100, filters: {} }));
    }
  }, [dispatch, isDialogOpen]);

  const successNotificationHandler = () => {
    toast({
      title: "Success",
      description: "Sub-activity added to price list successfully",
    });
    setIsDialogOpen(false);
    if (editData) {
      setEditData(null);
    }
  };

  const errorNotificationHandler = (error: any) => {
    setLoading("rejected");
    if (error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add sub activity to price list",
        variant: "destructive",
      });
    }
  };

  const handleAddPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    await dispatch(
      actAddPriceListSubActivity({
        priceListId: priceListId!,
        pricingMethod: data.pricingMethod,
        subActivityId: data.subActivity,
        basePrice: data.basePrice,
        locationPrices: data.locationPrices,
      })
    )
      .unwrap()
      .then((response) => {
        if (contextType === "customer") {
          dispatch(
            addPriceListSubActivity({
              priceListId: response.data._id!,
              subActivityPrices: response.data.subActivityPrices,
            })
          );
        }

        if (response.data) {
          successNotificationHandler();
          callback?.();
        }
      })
      .catch((error) => {
        errorNotificationHandler(error);
      });
  };

  const handleEditPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    await dispatch(
      actUpdateSubActivityPrice({
        priceListId: priceListId!,
        subActivityId: editData.subActivity._id,
        data: updateBodyPasrer(data, contextType),
      })
    )
      .unwrap()
      .catch((error) => {
        errorNotificationHandler(error);
      })
      .then(() => {
        successNotificationHandler();
        callback?.();
      });
  };

  const handleAddVendorPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    await dispatch(
      actAddVendorSubActivityPrice({
        vendorPriceListId: priceListId!,
        ...updateBodyPasrer(data, contextType),
      })
    )
      .unwrap()
      .catch((error) => {
        errorNotificationHandler(error);
      })
      .then(() => {
        successNotificationHandler();
        callback?.();
      });
  };

  const handleEditVendorPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    console.log("🎯 handleEditVendorPriceListSubActivity", data);
    await dispatch(
      actEditVendorSubActivityPrice({
        vendorPriceListId: priceListId!,
        subActivityId: subActivityPriceId!,
        ...updateBodyPasrer(data, contextType, true),
      })
    )
      .unwrap()
      .catch((error) => {
        if (error.message) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive",
          });
        }
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Price list updated successfully",
        });
        dispatch(actGetVendorPriceLists(vendorId!));
        setIsDialogOpen(false);
      });
  };

  const handleSubmit = async (data: any) => {
    console.groupCollapsed("🎯 SubActivityPriceManager - Form submitted:");
    console.log({
      contextType,
      customerId,
      vendorId,
      priceListId,
      subActivityPriceId,
      data,
    });
    console.groupEnd();

    setLoading("pending");
    if (!editData) {
      if (contextType === "vendor") {
        handleAddVendorPriceListSubActivity(data, () => {
          dispatch(actGetVendorPriceLists(vendorId!))
            .unwrap()
            .then(() => {
              setLoading("fulfilled");
              setIsDialogOpen(false);
            });
        });
      } else {
        handleAddPriceListSubActivity(data, () => {
          setLoading("fulfilled");
        });
      }
    } else {
      if (contextType === "vendor") {
        handleEditVendorPriceListSubActivity(data, () => {
          setLoading("fulfilled");
          setIsDialogOpen(false);
        });
      } else {
        handleEditPriceListSubActivity(data, () => {
          setLoading("fulfilled");
          if (contextType === "customer") {
            dispatch(actGetCustomer(customerId!));
          }
        });
      }
    }
  };

  // Use the custom hook for dialog management
  const { dialogProps } = useSubActivityPriceDialog({
    defaultValues: defaultValues,
    dialogOpen: isDialogOpen,
    addLocationDisabled: loading === "pending",
    submitLoading: loading === "pending",
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        setEditData(null);
        setIsDialogOpen(false);
      }
    },
    onSubmit: handleSubmit,
    onError(error) {
      console.log(error);
    },
  });

  // Customize dialog props
  const finalDialogProps = useMemo(
    () => ({
      ...dialogProps,
      dialogTitle: dialogTitle || "Add Sub-Activity",
      dialogDescription: dialogDescription || "Add a new sub-activity",
    }),
    [dialogProps, dialogTitle, dialogDescription]
  );

  return (
    <>{isDialogOpen && <SubActivityPriceDialog {...finalDialogProps} />}</>
  );
};

export default SubActivityPriceManager;
