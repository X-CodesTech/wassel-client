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

type TDeletePriceListSubActivityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
  priceListId: string;
};

const DeletePriceListSubActivityDialog = ({
  open,
  onOpenChange,
  selectedSubActivityPrice,
  priceListId,
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
        dispatch(actGetPriceListById(priceListId));
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
            onClick={handleDeleteSubActivity}
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
