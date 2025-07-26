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
import { Loader2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actDeletePriceList } from "@/store/priceLists";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type TDeleteSubActivityConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DeleteSubActivityConfirmationDialog = ({
  open,
  onOpenChange,
}: TDeleteSubActivityConfirmationDialogProps) => {
  const dispatch = useAppDispatch();
  const { selectedPriceList: priceList, loading } = useAppSelector(
    (state) => state.priceLists
  );
  const [, setLocation] = useLocation();

  const handleDelete = async () => {
    if (priceList?._id) {
      try {
        await dispatch(actDeletePriceList(priceList._id)).unwrap();
        onOpenChange(false);
        toast({
          title: "Price List Deleted",
          description: `"${priceList.name}" has been deleted successfully.`,
        });
        setLocation("/price-lists");
      } catch (error) {
        console.error("Failed to delete price list:", error);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the price list "{priceList?.name}".
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
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

export default DeleteSubActivityConfirmationDialog;
