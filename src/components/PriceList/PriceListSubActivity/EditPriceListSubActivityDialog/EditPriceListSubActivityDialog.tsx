import { SubActivityPrice } from "@/services/priceListServices";
import {
  PerItemEditPriceListSubActivity,
  PerLocationEditPriceListSubActivity,
  PerTripEditPriceListSubActivity,
} from "./";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

type TEditPriceListSubActivityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
  priceListId: string;
};

const EditPriceListSubActivityDialog = ({
  open,
  onOpenChange,
  selectedSubActivityPrice,
  priceListId,
}: TEditPriceListSubActivityDialogProps) => {
  const pricingMethod = selectedSubActivityPrice?.pricingMethod;

  const EDIT_PRICE_LIST_SUBACTIVITY_FORM = {
    perItem: (
      <PerItemEditPriceListSubActivity
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
      />
    ),
    perTrip: (
      <PerTripEditPriceListSubActivity
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
      />
    ),
    perLocation: (
      <PerLocationEditPriceListSubActivity
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
      />
    ),
  };

  const FormToRender = EDIT_PRICE_LIST_SUBACTIVITY_FORM[pricingMethod] || (
    <div>No form found</div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] max-h-[80dvh]">
        <DialogHeader>
          <DialogTitle>Edit Sub-Activity Price List</DialogTitle>
        </DialogHeader>
        <DialogDescription className="max-h-[500px] overflow-y-auto">
          {FormToRender}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceListSubActivityDialog;
