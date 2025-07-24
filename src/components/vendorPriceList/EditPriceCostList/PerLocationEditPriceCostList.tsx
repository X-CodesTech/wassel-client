import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubActivityPrice } from "@/services/vendorServices";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actEditVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors/vendorsSlice";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { actGetLocations } from "@/store/locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISubActivityPrice, TPricingMethod } from "@/types/ModelTypes";

type TPerLocationEditPriceCostListProps = {
  onOpenChange: (open: boolean) => void;
  selectedSubActivityPrice: SubActivityPrice;
};

const PerLocationEditPriceCostList = ({
  onOpenChange,
  selectedSubActivityPrice,
}: TPerLocationEditPriceCostListProps) => {
  const dispatch = useAppDispatch();
  const { priceLists, editSubActivityPriceLoading } = useAppSelector(
    (state) => state.vendors
  );
  const { records: locations } = useAppSelector((state) => state.locations);

  const vendorId = priceLists?.[0]?.vendor?._id || "";
  const vendorPriceListId = priceLists?.[0]?._id || "";
  const subActivityId = selectedSubActivityPrice.subActivity._id || "";

  return (
    <div>
      <h1>PerLocationEditPriceCostList</h1>
    </div>
  );
};

export default PerLocationEditPriceCostList;
