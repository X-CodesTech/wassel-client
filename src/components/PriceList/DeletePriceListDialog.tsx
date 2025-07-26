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
import { PriceList } from "@/services/priceListServices";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { toast } from "@/hooks/use-toast";
import { actDeletePriceList } from "@/store/priceLists";

interface DeletePriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingPriceList: PriceList;
}
const DeletePriceListDialog = ({
  open,
  onOpenChange,
  deletingPriceList,
}: DeletePriceListDialogProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.priceLists);

  // Handle delete price list
  const handleDeletePriceList = async () => {
    if (!deletingPriceList?._id) return;

    try {
      await dispatch(actDeletePriceList(deletingPriceList._id)).unwrap();

      onOpenChange(false);

      toast({
        title: "Price List Deleted",
        description: `"${deletingPriceList.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete price list:", error);
      toast({
        title: "Error",
        description: "Failed to delete price list. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the price list "
            {deletingPriceList?.name}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDeletePriceList}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePriceListDialog;
