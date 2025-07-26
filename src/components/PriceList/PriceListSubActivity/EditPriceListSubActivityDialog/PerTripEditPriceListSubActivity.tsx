import { SubActivityPrice } from "@/services/priceListServices";

interface PerTripEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}

const PerTripEditPriceListSubActivity = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: PerTripEditPriceListSubActivityProps) => {
  return <div>PerTripEditPriceListSubActivity</div>;
};

export default PerTripEditPriceListSubActivity;
