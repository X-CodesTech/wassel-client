import { SubActivityPrice } from "@/services/priceListServices";

interface PerItemEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}

const PerItemEditPriceListSubActivity = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: PerItemEditPriceListSubActivityProps) => {
  return <div>PerItemEditPriceListSubActivity</div>;
};

export default PerItemEditPriceListSubActivity;
