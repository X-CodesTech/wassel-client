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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { actAddPriceList } from "@/store/priceLists";
import { PriceList } from "@/services/priceListServices";

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

interface AddPriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPriceListDialog = ({
  open,
  onOpenChange,
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
      };

      await dispatch(actAddPriceList(priceListData)).unwrap();

      // Reset form and close modal
      form.reset();
      onOpenChange(false);

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
