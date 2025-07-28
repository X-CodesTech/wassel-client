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

const updateBodyPasrer = (data: any) => {
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
  const dispatch = useAppDispatch();
  const { selectedCustomer } = useAppSelector((state) => state.customers);
  customerId = selectedCustomer?._id || customerId || "";
  const [loading, setLoading] = useState<TLoading>("idle");

  React.useEffect(() => {
    dispatch(actGetLocations({ page: 1, limit: 100, filters: {} }));
  }, [dispatch]);

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
        data: updateBodyPasrer(data),
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

  const handleSubmit = async (data: any) => {
    console.group("🎯 SubActivityPriceManager - Form submitted:");
    console.log({
      contextType,
      customerId,
      vendorId,
      priceListId,
      subActivityPriceId,
      data,
    });
    console.groupEnd();

    // Here you would dispatch the appropriate action based on contextType
    // For now, just log the data

    setLoading("pending");
    if (!editData) {
      handleAddPriceListSubActivity(data, () => {
        setLoading("fulfilled");
      });
    } else {
      handleEditPriceListSubActivity(data, () => {
        setLoading("fulfilled");
        if (contextType === "customer") {
          dispatch(actGetCustomer(customerId!));
        }
      });
    }
  };

  // Use the custom hook for dialog management
  const { dialogProps } = useSubActivityPriceDialog({
    defaultValues: editData,
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
