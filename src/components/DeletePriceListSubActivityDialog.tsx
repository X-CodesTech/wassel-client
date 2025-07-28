import { SubActivityPrice } from "@/services/priceListServices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actDeleteSubActivityFromPriceList,
  actGetPriceListById,
} from "@/store/priceLists";
import { useToast } from "@/hooks/use-toast";
import {
  actDeleteVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors";
import { removePriceListSubActivity } from "@/store/customers";

type TDeletePriceListSubActivityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
  priceListId: string;
  contextType: "customer" | "vendor" | "priceList";
  vendorId?: string;
};

const DeletePriceListSubActivityDialog = ({
  open,
  onOpenChange,
  selectedSubActivityPrice,
  priceListId,
  vendorId = "",
  contextType,
}: TDeletePriceListSubActivityDialogProps) => {
  const dispatch = useAppDispatch();
  const { deleteSubActivityLoading } = useAppSelector(
    (state) => state.priceLists
  );
  const { toast } = useToast();

  const subActivityId = selectedSubActivityPrice?._id || "";

  const getSubActivityName = (subActivity: any) => {
    if (typeof subActivity === "string") {
      return "Unknown Activity";
    }
    return subActivity?.portalItemNameEn || "Unknown Activity";
  };

  const handleDeleteSubActivity = () => {
    dispatch(
      actDeleteSubActivityFromPriceList({
        priceListId,
        subActivityId,
      })
    )
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Sub-activity deleted successfully from price list",
        });
        // Refresh the price list data
        if (contextType === "priceList") {
          dispatch(actGetPriceListById(priceListId));
        } else if (contextType === "customer") {
          dispatch(
            removePriceListSubActivity({
              priceListId: priceListId,
              subActivityId: subActivityId,
            })
          );
        }
        onOpenChange(false);
      })
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
            description: "There is an error while deleting the sub-activity",
            variant: "destructive",
          });
        }
      });
  };

  const handleDeleteSubActivityFromVendor = async () => {
    try {
      await dispatch(
        actDeleteVendorSubActivityPrice({
          vendorPriceListId: priceListId,
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
        });
    } catch (error) {
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sub-Activity Confirmation</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete "
          {getSubActivityName(selectedSubActivityPrice?.subActivity)}" from this
          price list? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={deleteSubActivityLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={
              contextType === "vendor"
                ? handleDeleteSubActivityFromVendor
                : handleDeleteSubActivity
            }
            disabled={deleteSubActivityLoading}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePriceListSubActivityDialog;
