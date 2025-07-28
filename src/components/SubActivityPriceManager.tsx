import React, { useState, useMemo, useEffect } from "react";
import SubActivityPriceDialog from "@/modules/SubActivityPrice/SubActivityPriceDialog";
import { useSubActivityPriceDialog } from "@/hooks/useSubActivityPriceDialog";
import { useAppDispatch } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations";
import { TFormSchema } from "@/modules/SubActivityPrice/validation";

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

  const [defaultValues, setDefaultValues] = useState<TFormSchema | null>(
    editData || null
  );
  React.useEffect(() => {
    dispatch(actGetLocations({ page: 1, limit: 100, filters: {} }));
  }, [dispatch]);

  const handleSubmit = async (data: any) => {
    console.log("🎯 SubActivityPriceManager - Form submitted:", {
      contextType,
      customerId,
      vendorId,
      priceListId,
      subActivityPriceId,
      data,
    });

    // Here you would dispatch the appropriate action based on contextType
    // For now, just log the data
  };

  // Use the custom hook for dialog management
  const { dialogProps } = useSubActivityPriceDialog({
    defaultValues, // Pass editData directly
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

  useEffect(() => {
    if (editData) {
      setDefaultValues(editData);
    }

    return () => {
      setDefaultValues(null);
    };
  }, [editData]);

  return (
    <>{isDialogOpen && <SubActivityPriceDialog {...finalDialogProps} />}</>
  );
};

export default SubActivityPriceManager;
