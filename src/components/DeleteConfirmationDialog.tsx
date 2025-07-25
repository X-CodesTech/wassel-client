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
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { VendorPriceList } from "@/services/vendorServices";
import {
  actDeleteVendorPriceList,
  actGetVendorPriceLists,
} from "@/store/vendors";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: () => void;
  selectedPriceList: VendorPriceList;
  vendorId: string;
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  selectedPriceList,
  vendorId,
}: DeleteConfirmationDialogProps) {
  const dispatch = useAppDispatch();
  const { deletePriceListLoading } = useAppSelector((state) => state.vendors);

  const handleDeletePriceList = async () => {
    if (!selectedPriceList) return;

    dispatch(actDeleteVendorPriceList(selectedPriceList._id))
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
          description: "Price list deleted successfully",
        });
        dispatch(actGetVendorPriceLists(vendorId))
          .unwrap()
          .catch((error) => {
            if (error.message) {
              toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
              });
            }
          })
          .then(() => onOpenChange());
      });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Price List</AlertDialogTitle>
          <AlertDialogDescription>
            {`Are you sure you want to delete "${
              selectedPriceList?.name ||
              selectedPriceList?.nameAr ||
              "Price List"
            }"? This
            action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePriceListLoading === "pending"}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeletePriceList}
            disabled={deletePriceListLoading === "pending"}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePriceListLoading === "pending" ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
