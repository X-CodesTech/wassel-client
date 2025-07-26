import { PriceList } from "@/services/priceListServices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actUpdatePriceList } from "@/store/priceLists";
import { ISubActivity } from "@/types/ModelTypes";

// Form schema for price list
const priceListFormSchema = z.object({
  name: z.string().min(1, "Price list name (English) is required"),
  nameAr: z.string().min(1, "Price list name (Arabic) is required"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  effectiveFrom: z.string().min(1, "Effective from date is required"),
  effectiveTo: z.string().min(1, "Effective to date is required"),
  isActive: z.boolean(),
});

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

interface EditPriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceList: PriceList;
}

const EditPriceListDialog = ({
  open,
  onOpenChange,
  priceList,
}: EditPriceListDialogProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.priceLists);

  const editForm = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
    },
  });

  const onEditSubmit = async (data: PriceListFormValues) => {
    console.log("Edit form data:", data);
    if (!priceList?._id) {
      console.error("No editing price list ID found");
      return;
    }
    console.log("Processing edit for price list:", priceList._id);

    try {
      const priceListData: PriceList = {
        _id: priceList._id,
        name: data.name,
        nameAr: data.nameAr,
        description: data.description || "",
        descriptionAr: data.descriptionAr || "",
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        isActive: data.isActive,
        subActivityPrices: priceList.subActivityPrices,
      };

      console.log("Sending update request with data:", priceListData);

      await dispatch(
        actUpdatePriceList({
          id: priceList._id,
          priceList: priceListData,
        })
      ).unwrap();

      editForm.reset();
      onOpenChange(false);

      toast({
        title: "Price List Updated",
        description: `"${data.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update price list:", error);
      toast({
        title: "Error",
        description: "Failed to update price list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditFormSubmit = editForm.handleSubmit(
    (data) => {
      console.log("Form submitted with data:", data);
      console.log("Form errors:", editForm.formState.errors);
      onEditSubmit(data);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      const errorMessages = Object.values(errors)
        .map((error: any) => error?.message)
        .filter(Boolean)
        .join(", ");

      toast({
        title: "Validation Error",
        description:
          errorMessages || "Please check the form and fix any errors.",
        variant: "destructive",
      });
    }
  );

  const getSubActivityName = (subActivity: ISubActivity) => {
    return subActivity?.portalItemNameEn || "Unknown Activity";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bilingual Price List</DialogTitle>
          <DialogDescription>
            Update your comprehensive price list with English and Arabic
            support, date ranges, and flexible pricing methods.
          </DialogDescription>
        </DialogHeader>

        <Form {...editForm}>
          <form onSubmit={handleEditFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price List Name (English)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter price list name in English"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price List Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل اسم قائمة الأسعار بالعربية"
                        {...field}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter description in English"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل الوصف بالعربية"
                        {...field}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this price list becomes active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="effectiveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective To</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this price list expires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable this price list immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                Current Sub-Activities and Pricing
              </h4>
              <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
                {priceList &&
                priceList.subActivityPrices &&
                priceList.subActivityPrices.length > 0 ? (
                  <div className="space-y-2">
                    {priceList.subActivityPrices.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">
                          {getSubActivityName(item.subActivity as ISubActivity)}
                        </span>
                        <div className="flex gap-4">
                          <span className="font-medium text-green-600">
                            Price: ${item.basePrice?.toFixed(2) || "0.00"}
                          </span>
                          <span className="font-medium text-blue-600">
                            Cost: ${item.cost?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    No sub-activities configured for this price list.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                style={{
                  backgroundColor: "#1e88e5",
                  color: "white",
                  border: "none",
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Price List"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceListDialog;
