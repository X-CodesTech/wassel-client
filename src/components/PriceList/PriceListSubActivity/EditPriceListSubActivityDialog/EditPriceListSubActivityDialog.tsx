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
import { cn } from "@/utils";

type TEditPriceListSubActivityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
  priceListId: string;
  isCustomerPriceList?: boolean;
};

const EditPriceListSubActivityDialog = ({
  open,
  onOpenChange,
  selectedSubActivityPrice,
  priceListId,
  isCustomerPriceList = false,
}: TEditPriceListSubActivityDialogProps) => {
  const pricingMethod = selectedSubActivityPrice?.pricingMethod;

  const EDIT_PRICE_LIST_SUBACTIVITY_FORM = {
    perItem: (
      <PerItemEditPriceListSubActivity
        selectedSubActivityPrice={selectedSubActivityPrice}
        onOpenChange={onOpenChange}
        priceListId={priceListId}
        isCustomerPriceList={isCustomerPriceList}
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
      <DialogContent
        className={cn(
          "max-w-[80vw] h-[80dvh] flex flex-col",
          pricingMethod === "perItem" && "max-w-[60vw] h-[30dvh]"
        )}
      >
        <DialogHeader>
          <DialogTitle>Edit Sub-Activity Price List</DialogTitle>
        </DialogHeader>
        {FormToRender}
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceListSubActivityDialog;
