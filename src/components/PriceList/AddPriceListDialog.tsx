import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { TPricingMethod } from "@/types/ModelTypes";
import { actAddPriceList } from "@/store/priceLists";
import { PriceList } from "@/services/priceListServices";
import { TPriceListModalType } from "@/pages/PriceLists";

const priceListFormSchema = z.object({
  name: z.string().min(1, "Price list name (English) is required"),
  nameAr: z.string().min(1, "Price list name (Arabic) is required"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  effectiveFrom: z.string().min(1, "Effective from date is required"),
  effectiveTo: z.string().min(1, "Effective to date is required"),
  isActive: z.boolean(),
  subActivityPrices: z.array(
    z.object({
      subActivity: z.string().min(1, "Sub-activity is required"),
      pricingMethod: z.enum(["perItem", "perLocation", "perTrip"]),
      basePrice: z.number().min(0, "Base price must be positive").optional(),
      cost: z.number().min(0, "Cost must be positive"),
      locationPrices: z
        .array(
          z.object({
            location: z.string().min(1, "Location is required"),
            price: z.number().min(0, "Location price must be positive"),
          })
        )
        .optional(),
    })
  ),
});

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

interface AddPriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean, modalType?: TPriceListModalType) => void;
  selectedSubActivities: {
    id: string;
    name: string;
    price: string;
    cost: string;
    selected: boolean;
    pricingMethod: TPricingMethod;
  }[];
  subActivitiesAvailable: boolean;
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handlePricingMethodChange: (
    id: string,
    pricingMethod: TPricingMethod
  ) => void;
  handlePriceChange: (id: string, price: string) => void;
  handleCostChange: (id: string, cost: string) => void;
}

const AddPriceListDialog = ({
  open,
  onOpenChange,
  selectedSubActivities,
  subActivitiesAvailable,
  handleCheckboxChange,
  handlePricingMethodChange,
  handlePriceChange,
  handleCostChange,
}: AddPriceListDialogProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.priceLists);

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
      subActivityPrices: [],
    },
  });

  const onSubmit = async (data: PriceListFormValues) => {
    try {
      const priceListData: PriceList = {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description || "",
        descriptionAr: data.descriptionAr || "",
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        isActive: data.isActive,
        subActivityPrices:
          data.subActivityPrices?.map((subActivityPrice) => ({
            subActivity: subActivityPrice.subActivity,
            pricingMethod: subActivityPrice.pricingMethod,
            basePrice: subActivityPrice.basePrice,
            cost: subActivityPrice.cost,
            locationPrices: subActivityPrice.locationPrices,
          })) || [],
      };

      await dispatch(actAddPriceList(priceListData)).unwrap();

      // Reset form and close modal
      form.reset();
      onOpenChange(false, "AddPriceList");

      toast({
        title: "Price List Created",
        description: `"${data.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create price list:", error);
      toast({
        title: "Error",
        description: "Failed to create price list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = form.handleSubmit(
    (data) => {
      // Get selected items with their prices for subActivityPrices
      const selectedSubActivityPrices = selectedSubActivities
        .filter((item) => item.selected)
        .map((item) => ({
          subActivity: item.id,
          pricingMethod: item.pricingMethod,
          basePrice: parseFloat(item.price) || 0,
          cost: parseFloat(item.cost) || 0,
        }));

      // Check if any sub-activities are selected
      if (selectedSubActivityPrices.length === 0) {
        toast({
          title: "No Sub-Activities Selected",
          description:
            "Please select at least one sub-activity to create a price list.",
          variant: "destructive",
        });
        return;
      }

      // Create the final data with selected sub-activities
      const finalData = {
        ...data,
        subActivityPrices: selectedSubActivityPrices,
      };

      // Submit the form with the complete data
      onSubmit(finalData);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          Add New Bilingual Price List
          <DialogTitle></DialogTitle>
          <DialogDescription>
            Create a comprehensive price list with English and Arabic support,
            date ranges, and flexible pricing methods.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                Select Sub-Activities and Set Pricing
              </h4>
              {!subActivitiesAvailable ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-gray-500">
                    No sub-activities available. Create a price list first to
                    see available activities.
                  </span>
                </div>
              ) : (
                <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 w-8"></th>
                        <th className="text-left py-2 px-2">Activity</th>
                        <th className="text-left py-2 px-2 w-32">
                          Pricing Method
                        </th>
                        <th className="text-left py-2 px-2 w-32">
                          Base Price ($)
                        </th>
                        <th className="text-left py-2 px-2 w-32">Cost ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubActivities.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 px-2">
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(item.id, checked === true)
                              }
                            />
                          </td>
                          <td className="py-2 px-2">{item.name}</td>
                          <td className="py-2 px-2">
                            <Select
                              disabled={!item.selected}
                              value={item.pricingMethod}
                              onValueChange={(value: TPricingMethod) =>
                                handlePricingMethodChange(item.id, value)
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="perItem">
                                  Per Item
                                </SelectItem>
                                <SelectItem value="perLocation">
                                  Per Location
                                </SelectItem>
                                <SelectItem value="perTrip">
                                  Per Trip
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) =>
                                handlePriceChange(item.id, e.target.value)
                              }
                              disabled={!item.selected}
                              className="h-8"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.cost}
                              onChange={(e) =>
                                handleCostChange(item.id, e.target.value)
                              }
                              disabled={!item.selected}
                              className="h-8"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                    Creating...
                  </>
                ) : (
                  "Create Price List"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPriceListDialog;
