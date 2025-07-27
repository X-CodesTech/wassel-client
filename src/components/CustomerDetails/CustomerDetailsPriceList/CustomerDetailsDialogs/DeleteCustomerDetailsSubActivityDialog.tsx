import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actDeleteCustomerPriceListSubActivity,
  removePriceListSubActivity,
} from "@/store/customers";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CustomerPriceListResponse } from "@/services/customerServices";
import { toast } from "@/hooks/use-toast";

type TDeleteCustomerDetailsSubActivityDialog = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceList: CustomerPriceListResponse["priceList"];
  subActivityId: string;
};

const DeleteCustomerDetailsSubActivityDialog = ({
  open,
  onOpenChange,
  priceList,
  subActivityId,
}: TDeleteCustomerDetailsSubActivityDialog) => {
  const dispatch = useAppDispatch();
  const { loading: deletePriceListLoading } = useAppSelector(
    (state) => state.customers
  );

  const handleConfirm = async () => {
    await dispatch(
      actDeleteCustomerPriceListSubActivity({
        subActivityId: subActivityId,
        priceListId: priceList._id,
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
            description: "Unexpected error occurred",
            variant: "destructive",
          });
        }
      })
      .then(() => {
        dispatch(
          removePriceListSubActivity({
            priceListId: priceList._id,
            subActivityId: subActivityId,
          })
        );
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Sub-activity deleted successfully",
        });
      });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Price List</AlertDialogTitle>
          <AlertDialogDescription>
            {`Are you sure you want to delete "${
              priceList?.name || priceList?.nameAr || "Price List"
            }"? This
        action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePriceListLoading === "pending"}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deletePriceListLoading === "pending"}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePriceListLoading === "pending" ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCustomerDetailsSubActivityDialog;
