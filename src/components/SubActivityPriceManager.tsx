import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import SubActivityPriceDialog from "@/modules/SubActivityPrice/SubActivityPriceDialog";
import { useSubActivityPriceDialog } from "@/hooks/useSubActivityPriceDialog";
import { useAppDispatch } from "@/hooks/useAppSelector";
import { toast } from "@/hooks/use-toast";
import { actGetLocations } from "@/store/locations";

type ContextType = "customer" | "vendor" | "priceList";

interface SubActivityPriceManagerProps {
  // Context identification
  contextType: ContextType;
  vendorId?: string;
  customerId?: string;
  priceListId?: string;

  // Edit mode data
  subActivityPriceId?: string;
  editData?: any; // The sub-activity price data to edit

  // UI customization
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  icon?: React.ReactNode;

  // Callbacks
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onDelete?: (id: string) => void;

  // Dialog customization
  dialogTitle?: string;
  dialogDescription?: string;

  // Disable functionality
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * SubActivityPriceManager - A reusable component for managing sub-activity prices
 *
 * Usage Examples:
 *
 * // For Customer Details
 * <SubActivityPriceManager
 *   contextType="customer"
 *   customerId="customer123"
 *   priceListId="priceList456"
 *   onSuccess={(data) => console.log('Added:', data)}
 * />
 *
 * // For Vendor Details
 * <SubActivityPriceManager
 *   contextType="vendor"
 *   vendorId="vendor789"
 *   priceListId="priceList456"
 *   onSuccess={(data) => console.log('Added:', data)}
 * />
 *
 * // For Price List Details
 * <SubActivityPriceManager
 *   contextType="priceList"
 *   priceListId="priceList456"
 *   onSuccess={(data) => console.log('Added:', data)}
 * />
 *
 * // Edit Mode
 * <SubActivityPriceManager
 *   contextType="customer"
 *   customerId="customer123"
 *   priceListId="priceList456"
 *   subActivityPriceId="subActivity789"
 *   editData={existingData}
 *   onSuccess={(data) => console.log('Updated:', data)}
 * />
 */
const SubActivityPriceManager: React.FC<SubActivityPriceManagerProps> = ({
  contextType,
  vendorId,
  customerId,
  priceListId,
  subActivityPriceId,
  editData,
  buttonText,
  buttonVariant = "outline",
  buttonSize = "sm",
  showIcon = true,
  icon,
  onSuccess,
  onError,
  onDelete,
  dialogTitle,
  dialogDescription,
  disabled = false,
  readOnly = false,
}) => {
  const dispatch = useAppDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get the appropriate ID based on context
  const contextId = useMemo(() => {
    switch (contextType) {
      case "vendor":
        return vendorId;
      case "customer":
        return customerId;
      case "priceList":
        return priceListId;
      default:
        return undefined;
    }
  }, [contextType, vendorId, customerId, priceListId]);

  // Determine if we're in edit mode
  const isEditMode = useMemo(() => {
    return !!(subActivityPriceId || editData);
  }, [subActivityPriceId, editData]);

  // Default button text based on mode
  const defaultButtonText = useMemo(() => {
    if (readOnly) return "View";
    return isEditMode ? "Edit" : "Add";
  }, [isEditMode, readOnly]);

  // Default icon based on mode
  const defaultIcon = useMemo(() => {
    if (readOnly) return null;
    return isEditMode ? (
      <Edit className="h-4 w-4" />
    ) : (
      <Plus className="h-4 w-4" />
    );
  }, [isEditMode, readOnly]);

  // Handle success callback
  const handleSuccess = useCallback(
    (data: any) => {
      toast({
        title: "Success",
        description: isEditMode
          ? "Sub-activity updated successfully"
          : "Sub-activity added successfully",
      });

      onSuccess?.(data);
      setIsDialogOpen(false);
    },
    [isEditMode, onSuccess]
  );

  // Handle error callback
  const handleError = useCallback(
    (error: any) => {
      const errorMessage = error?.message || "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      onError?.(error);
    },
    [onError]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: any) => {
      if (!contextId) {
        throw new Error("Context ID is required");
      }

      try {
        // For now, we'll just log the data and call success
        // In a real implementation, you would dispatch the appropriate actions
        console.log("Submitting data:", {
          contextType,
          contextId,
          isEditMode,
          data,
        });

        // Simulate success
        handleSuccess(data);
      } catch (error) {
        handleError(error);
      }
    },
    [contextType, contextId, isEditMode, handleSuccess, handleError]
  );

  // Initialize locations when component mounts
  React.useEffect(() => {
    dispatch(actGetLocations({ page: 1, limit: 999999, filters: {} }));
  }, [dispatch]);

  // Use the custom hook for dialog management
  const { dialogProps } = useSubActivityPriceDialog({
    userType: contextType,
    defaultValues: editData,
    dialogOpen: isDialogOpen,
    onSubmit: handleSubmit,
    onError: handleError,
    onOpenChange: setIsDialogOpen,
  });

  // Customize dialog props
  const finalDialogProps = useMemo(
    () => ({
      ...dialogProps,
      dialogTitle:
        dialogTitle || (isEditMode ? "Edit Sub-Activity" : "Add Sub-Activity"),
      dialogDescription:
        dialogDescription ||
        (isEditMode
          ? "Edit the selected sub-activity pricing"
          : "Add a new sub-activity to the price list"),
    }),
    [dialogProps, dialogTitle, dialogDescription, isEditMode]
  );

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled}
      >
        {showIcon && (icon || defaultIcon)}
        {buttonText || defaultButtonText}
      </Button>

      <SubActivityPriceDialog {...finalDialogProps} />
    </>
  );
};

export default SubActivityPriceManager;
