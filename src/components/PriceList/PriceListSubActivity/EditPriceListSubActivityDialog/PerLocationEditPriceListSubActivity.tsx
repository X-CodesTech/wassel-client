import { SubActivityPrice } from "@/services/priceListServices";

interface PerLocationEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}

const PerLocationEditPriceListSubActivity = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: PerLocationEditPriceListSubActivityProps) => {
  return <div>PerLocationEditPriceListSubActivity</div>;
};

export default PerLocationEditPriceListSubActivity;
