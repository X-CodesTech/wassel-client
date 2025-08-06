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
import DeletePriceListSubActivityDialog from "./DeletePriceListSubActivityDialog";

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
            locationPrices: data.locationPrices?.map((lp: any) => ({
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
            locationPrices: data.locationPrices?.map((lp: any) => ({
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
  isDelete?: boolean;
  setIsDelete?: (isDelete: boolean) => void;
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
  isDelete,
  setIsDelete,
}) => {
  const defaultValues = useMemo(() => {
    if (!editData) return undefined;
    if (contextType === "vendor") {
      return {
        subActivity: editData?.subActivity,
        pricingMethod: editData?.pricingMethod || "perItem",
        locationPrices:
          editData?.locationPrices?.map((lp: any) => ({
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
    try {
      // Transform the form data to match the expected API structure
      const submitData: any = {
        pricingMethod: data.pricingMethod,
        priceListId: priceListId!,
        subActivityId: data.subActivity,
      };

      // Add pricing method specific data
      if (data.pricingMethod === "perItem") {
        submitData.basePrice = data.basePrice;
      } else if (
        data.pricingMethod === "perLocation" ||
        data.pricingMethod === "perTrip"
      ) {
        submitData.locationPrices = data.locationPrices;
      }

      const response = await dispatch(
        actAddPriceListSubActivity(submitData)
      ).unwrap();

      if (contextType === "customer") {
        dispatch(
          addPriceListSubActivity({
            priceListId: response.data._id!,
            subActivityPrices: (response.data.subActivityPrices as any) || [],
          })
        );
      }

      if (response.data) {
        successNotificationHandler();
        callback?.();
      }
    } catch (error) {
      errorNotificationHandler(error);
    }
  };

  const handleEditPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    try {
      await dispatch(
        actUpdateSubActivityPrice({
          priceListId: priceListId!,
          subActivityId: editData.subActivity._id,
          data: updateBodyPasrer(data, contextType),
        })
      ).unwrap();

      successNotificationHandler();
      callback?.();
    } catch (error) {
      errorNotificationHandler(error);
    }
  };

  const handleAddVendorPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    try {
      const vendorData = updateBodyPasrer(data, contextType);
      await dispatch(
        actAddVendorSubActivityPrice({
          vendorPriceListId: priceListId!,
          ...vendorData,
        } as any)
      ).unwrap();

      successNotificationHandler();
      callback?.();
    } catch (error) {
      errorNotificationHandler(error);
    }
  };

  const handleEditVendorPriceListSubActivity = async (
    data: any,
    callback?: () => void
  ) => {
    console.log("🎯 handleEditVendorPriceListSubActivity", data);
    try {
      const vendorEditData = updateBodyPasrer(data, contextType, true);
      await dispatch(
        actEditVendorSubActivityPrice({
          vendorPriceListId: priceListId!,
          subActivityId: subActivityPriceId!,
          ...vendorEditData,
        } as any)
      ).unwrap();

      toast({
        title: "Success",
        description: "Price list updated successfully",
      });
      dispatch(actGetVendorPriceLists(vendorId!));
      setIsDialogOpen(false);
      callback?.();
    } catch (error: any) {
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
    }
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
    defaultValues,
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

  if (isDelete && editData && priceListId && setIsDelete) {
    return (
      <DeletePriceListSubActivityDialog
        contextType={contextType}
        open={isDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsDelete?.(false);
            setEditData(null);
          }
        }}
        selectedSubActivityPrice={editData}
        priceListId={priceListId || ""}
        vendorId={vendorId || ""}
      />
    );
  }

  return (
    <>{isDialogOpen && <SubActivityPriceDialog {...finalDialogProps} />}</>
  );
};

export default SubActivityPriceManager;
