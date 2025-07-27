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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  actGetCustomer,
  updateCustomerPriceListSubActivity,
} from "@/store/customers/customersSlice";
import { useParams } from "wouter";

interface PerItemEditPriceListSubActivityProps {
  selectedSubActivityPrice: SubActivityPrice;
  onOpenChange: (open: boolean) => void;
  priceListId: string;
  isCustomerPriceList?: boolean;
}

// per‐item schema for edit
const perItemEditSchema = z
  .object({
    pricingMethod: z.literal("perItem"),
    basePrice: z.number().min(0, "Base price must be positive"),
  })
  .strict();

type TPerItemEditSchema = z.infer<typeof perItemEditSchema>;

const PerItemEditPriceListSubActivity = ({
  selectedSubActivityPrice,
  onOpenChange,
  priceListId,
  isCustomerPriceList = false,
}: PerItemEditPriceListSubActivityProps) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
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
    const form = useForm<TPerItemEditSchema>({
      defaultValues: {
        pricingMethod: "perItem" as const,
        basePrice: selectedSubActivityPrice.basePrice || 0,
      },
      resolver: zodResolver(perItemEditSchema),
      mode: "all",
    });

    // Check if form is valid
    const isFormValid = form.formState.isValid;
    const hasErrors = Object.keys(form.formState.errors).length > 0;

    // Check if form has changes
    const hasFormChanges =
      form.watch("basePrice") !== (selectedSubActivityPrice.basePrice || 0);

    const onSubmit = (data: TPerItemEditSchema) => {
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
          if (isCustomerPriceList) {
            dispatch(actGetCustomer(id!));
          }

          toast({
            title: "Success",
            description: "Price list updated successfully",
          });
          onOpenChange(false);
        });
    };

    return (
      <Form {...form}>
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="flex gap-4 items-end my-auto">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem className="flex-1">
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isFormValid || hasErrors || !hasFormChanges}
            >
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
