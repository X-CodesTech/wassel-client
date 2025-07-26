import { useAppDispatch } from "@/hooks/useAppSelector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubActivityPrice } from "@/services/priceListServices";
import { actUpdateSubActivityPrice } from "@/store/priceLists";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const getSubActivityId = (subActivity: any): string => {
    if (typeof subActivity === "string") {
      return subActivity;
    }
    if (
      subActivity &&
      typeof subActivity === "object" &&
      "_id" in subActivity
    ) {
      return subActivity._id;
    }
    return "";
  };

  const subActivityId = getSubActivityId(selectedSubActivityPrice.subActivity);
  const pricingMethod = selectedSubActivityPrice.pricingMethod;

  if (pricingMethod === "perItem") {
    const schema = z.object({
      basePrice: z.number().min(0, "Base price must be positive"),
    });

    const form = useForm<z.infer<typeof schema>>({
      defaultValues: {
        basePrice: selectedSubActivityPrice.basePrice || 0,
      },
      resolver: zodResolver(schema),
    });

    const onSubmit = (data: z.infer<typeof schema>) => {
      dispatch(
        actUpdateSubActivityPrice({
          priceListId,
          subActivityId,
          data: {
            basePrice: data.basePrice,
          },
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
          onOpenChange(false);
        });
    };

    return (
      <Form {...form}>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Base Price</FormLabel>
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
        </div>
      </Form>
    );
  }

  return <div>Invalid pricing method for this form</div>;
};

export default PerItemEditPriceListSubActivity;
