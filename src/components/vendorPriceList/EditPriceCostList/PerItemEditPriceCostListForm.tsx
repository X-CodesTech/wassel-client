import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubActivityPrice } from "@/services/vendorServices";
import {
  actEditVendorSubActivityPrice,
  actGetVendorPriceLists,
} from "@/store/vendors/vendorsSlice";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PerItemEditPriceCostListForm = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
}: {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
}) => {
  const dispatch = useAppDispatch();
  const { priceLists } = useAppSelector((state) => state.vendors);

  const vendorId = priceLists?.[0]?.vendor?._id || "";
  const vendorPriceListId = priceListId;
  const subActivityId = selectedSubActivityPrice.subActivity._id || "";
  const pricingMethod = selectedSubActivityPrice.pricingMethod;

  if (pricingMethod === "perItem") {
    const schema = z.object({
      cost: z.number().min(0, "Cost must be positive"),
    });

    const form = useForm<z.infer<typeof schema>>({
      defaultValues: {
        cost: selectedSubActivityPrice.cost,
      },
      resolver: zodResolver(schema),
    });

    const onSubmit = (data: z.infer<typeof schema>) => {
      dispatch(
        actEditVendorSubActivityPrice({
          pricingMethod: "perItem",
          vendorPriceListId,
          subActivityId,
          cost: data.cost,
        })
      )
        .unwrap()
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
              description: "An unexpected error occurred",
              variant: "destructive",
            });
          }
        })
        .then(() => {
          toast({
            title: "Success",
            description: "Price list updated successfully",
          });
          dispatch(actGetVendorPriceLists(vendorId));
          onOpenChange(false);
        });
    };

    return (
      <Form {...form}>
        <div className="flex gap-4 items-end">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Save
          </Button>
        </div>
      </Form>
    );
  }
};

export default PerItemEditPriceCostListForm;
