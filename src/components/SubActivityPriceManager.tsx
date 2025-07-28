import React, { useState, useMemo } from "react";
import SubActivityPriceDialog from "@/modules/SubActivityPrice/SubActivityPriceDialog";
import { useSubActivityPriceDialog } from "@/hooks/useSubActivityPriceDialog";
import { useAppDispatch } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations";

type ContextType = "customer" | "vendor" | "priceList";

interface SubActivityPriceManagerProps {
  contextType: ContextType;
  editData?: any;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  dialogTitle: string;
  dialogDescription: string;

  customerId?: string;
  vendorId?: string;
  priceListId?: string;
  subActivityPriceId?: string;
}

const SubActivityPriceManager: React.FC<SubActivityPriceManagerProps> = ({
  contextType,
  editData,
  isDialogOpen,
  setIsDialogOpen,
  dialogTitle,
  dialogDescription,
  customerId,
  vendorId,
  priceListId,
  subActivityPriceId,
}) => {
  const dispatch = useAppDispatch();

  // Initialize locations when component mounts
  React.useEffect(() => {
    dispatch(actGetLocations({ page: 1, limit: 10, filters: {} }));
  }, [dispatch]);

  const handleSubmit = async (data: any) => {
    console.log({
      contextType,
      customerId,
      vendorId,
      priceListId,
      subActivityPriceId,
      data,
    });
  };

  // Use the custom hook for dialog management
  const { dialogProps } = useSubActivityPriceDialog({
    userType: contextType,
    defaultValues: editData,
    dialogOpen: isDialogOpen,
    onOpenChange: setIsDialogOpen,
    onSubmit: handleSubmit,
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
