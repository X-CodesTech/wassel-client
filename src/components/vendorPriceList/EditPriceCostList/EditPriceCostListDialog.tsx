import { SubActivityPrice } from "@/services/vendorServices";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "../../ui/dialog";
import PerItemEditPriceCostListForm from "./PerItemEditPriceCostListForm";
import PerLocationEditPriceCostList from "./PerLocationEditPriceCostList";
import PerTripEditPriceCostList from "./PerTripEditPriceCostList";

type TEditPriceCostListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
  priceListId: string;
};

const EditPriceCostListDialog = ({
  open,
  onOpenChange,
  selectedSubActivityPrice,
  priceListId,
}: TEditPriceCostListDialogProps) => {
  const pricingMethod = selectedSubActivityPrice.pricingMethod;

  const EDIT_PRICE_COST_LIST_FORM = {
    perItem: (
      <PerItemEditPriceCostListForm
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
      />
    ),
    perTrip: (
      <PerTripEditPriceCostList
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
      />
    ),
    perLocation: (
      <PerLocationEditPriceCostList
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
      />
    ),
  };

  const FormToRender = EDIT_PRICE_COST_LIST_FORM[pricingMethod] || (
    <div>No form found</div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Price List</DialogTitle>
        </DialogHeader>
        <DialogDescription className="max-h-[500px] overflow-y-auto">
          {FormToRender}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceCostListDialog;
