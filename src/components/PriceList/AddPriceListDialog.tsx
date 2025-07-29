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
import { useState, useEffect } from "react";
import { actCreateCustomerPriceList } from "@/store/customers";

const priceListFormSchema = z
  .object({
    name: z.string().min(1, "Price list name (English) is required"),
    nameAr: z.string().min(1, "Price list name (Arabic) is required"),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
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

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

interface AddPriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit?: boolean;
  isCustomer?: boolean;
  customerId?: string;
}

const AddPriceListDialog = ({
  open,
  onOpenChange,
  isEdit = false,
  isCustomer = false,
  customerId,
}: AddPriceListDialogProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.priceLists);
  const { createPriceListLoading: customerLoading } = useAppSelector(
    (state) => state.customers
  );
  const [isAnyInputFocused, setIsAnyInputFocused] = useState(false);

  // Determine if we're in a loading state
  const isLoading = isCustomer
    ? customerLoading === "pending"
    : loading === true;

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

  // Reset paste success state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsAnyInputFocused(false);
    }
  }, [open]);

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

  // JSON validation schema
  const validateJsonStructure = (data: any) => {
    const requiredFields = ["name", "nameAr"];
    const optionalFields = [
      "description",
      "descriptionAr",
      "effectiveFrom",
      "effectiveTo",
      "active",
    ];

    // Check if required fields exist
    for (const field of requiredFields) {
      if (
        !data.hasOwnProperty(field) ||
        typeof data[field] !== "string" ||
        data[field].trim() === ""
      ) {
        return {
          isValid: false,
          message: `Missing or invalid required field: ${field}`,
        };
      }
    }

    // Check if optional fields have correct types when present
    for (const field of optionalFields) {
      if (data.hasOwnProperty(field)) {
        if (field === "active" && typeof data[field] !== "boolean") {
          return {
            isValid: false,
            message: `Field 'active' must be a boolean`,
          };
        }
        if (field !== "active" && typeof data[field] !== "string") {
          return {
            isValid: false,
            message: `Field '${field}' must be a string`,
          };
        }
      }
    }

    return { isValid: true };
  };

  const handlePasteJson = async () => {
    // Don't allow paste if any input is focused or if loading
    if (isAnyInputFocused || isLoading) {
      toast({
        title: isLoading ? "Form Disabled" : "Input Active",
        description: isLoading
          ? "Cannot paste data while form is being submitted."
          : "Please finish editing the current field before pasting JSON data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await navigator.clipboard.readText();

      if (!text.trim()) {
        toast({
          title: "Empty Clipboard",
          description: "No data found in clipboard.",
          variant: "destructive",
        });
        return;
      }

      const jsonData = JSON.parse(text);

      // Validate JSON structure
      const validation = validateJsonStructure(jsonData);
      if (!validation.isValid) {
        toast({
          title: "Invalid JSON Structure",
          description: validation.message,
          variant: "destructive",
        });
        return;
      }

      // Map the JSON data to form fields
      const formData = {
        name: jsonData.name || "",
        nameAr: jsonData.nameAr || "",
        description: jsonData.description || "",
        descriptionAr: jsonData.descriptionAr || "",
        effectiveFrom: jsonData.effectiveFrom || "",
        effectiveTo: jsonData.effectiveTo || "",
        isActive: jsonData.active !== undefined ? jsonData.active : true,
      };

      // Set form values
      form.reset(formData);

      toast({
        title: "JSON Data Pasted",
        description: "Form fields have been populated with the pasted data.",
      });
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      toast({
        title: "Invalid JSON",
        description:
          "Please ensure you have valid JSON data in your clipboard.",
        variant: "destructive",
      });
    }
  };

  // Keyboard event listener for paste functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if dialog is open and no input is focused and not loading
      if (!open || isAnyInputFocused || isLoading) {
        return;
      }

      // Check for Ctrl+V (Windows/Linux) or Cmd+V (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        handlePasteJson();
      }
    };

    // Add event listener when dialog is open
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isAnyInputFocused, isLoading]);

  const onSubmit = async (data: PriceListFormValues) => {
    try {
      if (isCustomer) {
        // Customer price list expects Date objects
        const customerPriceListData = {
          name: data.name,
          nameAr: data.nameAr,
          description: data.description || "",
          descriptionAr: data.descriptionAr || "",
          effectiveFrom: new Date(data.effectiveFrom),
          effectiveTo: new Date(data.effectiveTo),
          isActive: data.isActive,
        };

        await dispatch(
          actCreateCustomerPriceList({
            customerId: customerId!,
            priceListData: customerPriceListData,
          })
        ).unwrap();
      } else {
        // Regular price list expects string dates
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
      }

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
          <DialogTitle>Add New Bilingual Price List</DialogTitle>
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
                        disabled={isLoading}
                        onFocus={() => setIsAnyInputFocused(true)}
                        onBlur={() => setIsAnyInputFocused(false)}
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
                        onFocus={() => setIsAnyInputFocused(true)}
                        onBlur={() => setIsAnyInputFocused(false)}
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
                        onFocus={() => setIsAnyInputFocused(true)}
                        onBlur={() => setIsAnyInputFocused(false)}
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
                        onFocus={() => setIsAnyInputFocused(true)}
                        onBlur={() => setIsAnyInputFocused(false)}
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
                        onFocus={() => setIsAnyInputFocused(true)}
                        onBlur={() => setIsAnyInputFocused(false)}
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
                        onFocus={() => setIsAnyInputFocused(true)}
                        onBlur={() => setIsAnyInputFocused(false)}
                      />
                    </FormControl>
                    <FormDescription>
                      When this price list expires (must be after today)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEdit ? (
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
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : null}
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

export default AddPriceListDialog;
