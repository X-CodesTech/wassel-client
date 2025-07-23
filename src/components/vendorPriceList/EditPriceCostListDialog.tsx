import { PricingMethod, SubActivityPrice } from "@/services/vendorServices";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actEditVendorSubActivityPrice } from "@/store/vendors/act/actEditVendorSubActivityPrice";
import { actGetVendorPriceLists } from "@/store/vendors";

const FormToRender = ({
  pricingMethod,
  selectedSubActivityPrice,
}: {
  pricingMethod: PricingMethod;
  selectedSubActivityPrice: SubActivityPrice;
  vendorPriceListId: string;
}) => {
  const dispatch = useAppDispatch();
  const { priceLists } = useAppSelector((state) => state.vendors);

  const vendorPriceListId = priceLists?.[0]?._id || "";
  const subActivityId = selectedSubActivityPrice.subActivity._id || "";

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
          dispatch(actGetVendorPriceLists(priceLists?.[0]?.vendor?._id || ""));
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

  if (pricingMethod === "perLocation") {
    const schema = z.object({
      locationPrices: z.array(
        z.object({
          location: z.string(),
          cost: z.number().min(0, "Cost must be positive"),
        })
      ),
    });

    const form = useForm<z.infer<typeof schema>>({
      defaultValues: {
        locationPrices: selectedSubActivityPrice.locationPrices.map(
          (locationPrice) => ({
            location: locationPrice.location?._id,
            cost: locationPrice.cost,
          })
        ),
      },
      resolver: zodResolver(schema),
    });

    const onSubmit = (data: z.infer<typeof schema>) => {
      dispatch(
        actEditVendorSubActivityPrice({
          pricingMethod: "perLocation",
          vendorPriceListId,
          subActivityId,
          locationPrices: data.locationPrices,
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
          dispatch(actGetVendorPriceLists(vendorPriceListId));
        });
    };
    return (
      <Form {...form}>
        <FormControl>
          <FormField
            control={form.control}
            name="locationPrices"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Location Prices</FormLabel>
              </FormItem>
            )}
          />
        </FormControl>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
          Save
        </Button>
      </Form>
    );
  }

  return <div>Per Location</div>;
};

const EditPriceCostListDialog = ({
  open,
  onOpenChange,
  pricingMethod,
  selectedSubActivityPrice,
  vendorPriceListId,
}: {
  vendorPriceListId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricingMethod: PricingMethod;
  selectedSubActivityPrice: SubActivityPrice;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Price List</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <FormToRender
            pricingMethod={pricingMethod}
            selectedSubActivityPrice={selectedSubActivityPrice}
            vendorPriceListId={vendorPriceListId}
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceCostListDialog;
