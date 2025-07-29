import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { actCreateVendorPriceList } from "@/store/vendors/act/actCreateVendorPriceList";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { toast } from "@/hooks/use-toast";
import { actGetVendorPriceLists } from "@/store/vendors/act/actGetVendorPriceLists";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

type TCreatePriceListDialogProps = {
  vendorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z
  .object({
    name: z.string().min(1, "Price list name is required"),
    nameAr: z.string().min(1, "Price list name (Arabic) is required"),
    description: z.string().min(1, "Description is required"),
    descriptionAr: z.string().min(1, "Description (Arabic) is required"),
    effectiveFrom: z.string().min(1, "Effective from date is required"),
    effectiveTo: z.string().min(1, "Effective to date is required"),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.effectiveFrom) {
        const fromDate = new Date(data.effectiveFrom);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        fromDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        return fromDate >= today;
      }
      return true;
    },
    {
      message: "Effective from date must not be before today",
      path: ["effectiveFrom"], // Show error on effectiveFrom field
    }
  )
  .refine(
    (data) => {
      if (data.effectiveFrom && data.effectiveTo) {
        const fromDate = new Date(data.effectiveFrom);
        const toDate = new Date(data.effectiveTo);
        return fromDate < toDate;
      }
      return true;
    },
    {
      message: "Effective from date must be before effective to date",
      path: ["effectiveTo"], // Show error on effectiveTo field
    }
  )
  .refine(
    (data) => {
      if (data.effectiveTo) {
        const toDate = new Date(data.effectiveTo);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        toDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        return toDate > today;
      }
      return true;
    },
    {
      message: "Effective to date must be after today",
      path: ["effectiveTo"], // Show error on effectiveTo field
    }
  );

type FormValues = z.infer<typeof formSchema>;

const CreatePriceListDialog = ({
  vendorId,
  open,
  onOpenChange,
}: TCreatePriceListDialogProps) => {
  const dispatch = useAppDispatch();
  const { createPriceListLoading } = useAppSelector((state) => state.vendors);

  // Check if loading
  const isLoading = createPriceListLoading === "pending";

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get tomorrow's date in YYYY-MM-DD format for min attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      effectiveFrom: getTodayDate(),
      effectiveTo: getTomorrowDate(),
      isActive: true,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(
        actCreateVendorPriceList({ ...data, vendorId, subActivityPrices: [] })
      ).unwrap();

      toast({
        title: "Success",
        description: "Price list created successfully",
      });

      form.reset();
      onOpenChange(false);
      dispatch(actGetVendorPriceLists(vendorId));
    } catch (error) {
      console.error("Failed to create vendor price list:", error);
      toast({
        title: "Error",
        description: "Failed to create price list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
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

  // Prevent dialog from closing when loading
  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading && !newOpen) {
      toast({
        title: "Form Submitting",
        description: "Please wait while the price list is being created.",
        variant: "default",
      });
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[80vw] max-h-[80dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Vendor Price List</DialogTitle>
          <DialogDescription>
            Create a comprehensive vendor price list with English and Arabic
            support, date ranges, and flexible pricing methods.
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                      <Input
                        type="date"
                        {...field}
                        min={getTodayDate()}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      When this price list becomes active (today or later)
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
                      <Input
                        type="date"
                        {...field}
                        min={getTomorrowDate()}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      When this price list expires (must be after today)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? (
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

export default CreatePriceListDialog;
