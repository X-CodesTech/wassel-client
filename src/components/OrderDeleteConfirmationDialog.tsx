import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import orderServices from "@/services/orderServices";

interface OrderDeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any; // Order object
  onDeleteSuccess?: () => void;
}

export default function OrderDeleteConfirmationDialog({
  open,
  onOpenChange,
  order,
  onDeleteSuccess,
}: OrderDeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteOrder = async () => {
    if (!order?._id) return;

    setIsDeleting(true);
    try {
      await orderServices.deleteOrder(order._id);

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      onOpenChange(false);
      onDeleteSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete order";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const orderIdentifier = order?.orderIndex || order?._id?.slice(-6) || "Order";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete order "{orderIdentifier}"? This
            action cannot be undone and will permanently remove all order data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteOrder}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
