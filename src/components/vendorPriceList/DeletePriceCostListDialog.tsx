import { SubActivityPrice } from "@/services/vendorServices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actDeleteVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors";
import { toast } from "@/hooks/use-toast";

type TDeletePriceCostListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
};

const DeletePriceCostListDialog = ({
  open,
  onOpenChange,
  selectedSubActivityPrice,
}: TDeletePriceCostListDialogProps) => {
  const dispatch = useAppDispatch();
  const { priceLists, deleteSubActivityPriceLoading } = useAppSelector(
    (state) => state.vendors
  );

  const vendorId = priceLists?.[0]?.vendor?._id || "";
  const vendorPriceListId = priceLists?.[0]?._id || "";
  const subActivityId = selectedSubActivityPrice?._id || "";

  const handleDeletePriceList = () => {
    dispatch(
      actDeleteVendorSubActivityPrice({
        vendorPriceListId,
        subActivityPriceId: subActivityId,
      })
    )
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Price list deleted successfully",
        });
        dispatch(actGetVendorPriceLists(vendorId));
        onOpenChange(false);
      })
      .catch((error) => {
        if (error.message) {
          toast({
            title: "Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Error",
            description: "There is an error while deleting the price list",
          });
        }
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Price List Confirmation</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this price list?
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={deleteSubActivityPriceLoading === "pending"}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeletePriceList}
            disabled={deleteSubActivityPriceLoading === "pending"}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePriceCostListDialog;
