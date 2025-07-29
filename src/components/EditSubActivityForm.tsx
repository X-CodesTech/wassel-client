import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Activity, SubActivity, TransactionType } from "@/types/types";
import subActivityServices from "@/services/subActivityServices";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector } from "@/hooks/useAppSelector";

// Form validation schema matching the add form design
const formSchema = z
  .object({
    parentId: z.string(),
    activity: z.string().min(1, "Activity is required"),
    transactionType: z.string().min(1, "Transaction type is required"),
    financeEffect: z.union([
      z.literal("none"),
      z.literal("positive"),
      z.literal("negative"),
    ]),
    pricingMethod: z.union([
      z.literal("perLocation"),
      z.literal("perItem"),
      z.literal("perTrip"),
    ]),
    portalItemNameEn: z
      .string()
      .min(1, "Portal item name (English) is required"),
    portalItemNameAr: z
      .string()
      .min(1, "Portal item name (Arabic) is required"),
    usedByFinance: z.boolean(),
    usedByOperations: z.boolean(),
    inShippingUnit: z.boolean(),
    active: z.boolean(),
    specialRequirement: z.boolean(),
  })
  .refine(
    (data) => {
      // Ensure sub-activity transaction type matches parent activity transaction type
      return true; // This will be validated in the component
    },
    {
      message:
        "Sub-activity transaction type must match parent activity transaction type",
      path: ["transactionType"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface EditSubActivityFormProps {
  parentActivity: Activity;
  subActivity: SubActivity;
  onClose: () => void;
}

export default function EditSubActivityForm({
  parentActivity,
  subActivity,
  onClose,
}: EditSubActivityFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { records: transactionTypes, loading: transactionTypesLoading } =
    useAppSelector((state) => state.transactionTypes);

  // Initialize form with sub-activity data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: parentActivity._id,
      activity: parentActivity.actSrl,
      transactionType: parentActivity.activityTransactionType, // Always use parent activity's transaction type
      financeEffect: subActivity.financeEffect,
      pricingMethod: subActivity.pricingMethod,
      portalItemNameEn: subActivity.portalItemNameEn,
      portalItemNameAr: subActivity.portalItemNameAr,
      usedByFinance: subActivity.isUsedByFinance,
      usedByOperations: subActivity.isUsedByOps,
      inShippingUnit: subActivity.isInShippingUnit,
      active: subActivity.isActive,
      specialRequirement: subActivity.isInSpecialRequirement,
    },
  });

  // Update sub-activity mutation
  const updateSubActivityMutation = async (values: FormValues) => {
    try {
      const updateData = {
        transactionType: parentActivity.activityTransactionType, // Send just the ID string
        activity: parentActivity._id!,
        pricingMethod: values.pricingMethod,
        portalItemNameEn: values.portalItemNameEn,
        portalItemNameAr: values.portalItemNameAr,
        isActive: values.active,
        financeEffect: values.financeEffect,
        isUsedByFinance: values.usedByFinance,
        isUsedByOps: values.usedByOperations,
        isInShippingUnit: values.inShippingUnit,
        isInSpecialRequirement: values.specialRequirement,
      };

      await subActivityServices.updateSubActivity(
        subActivity._id!,
        updateData as any // API expects string IDs, not full objects
      );

      toast({
        title: "Success",
        description: "Portal item updated successfully",
      });

      onClose();
    } catch (error: any) {
      console.error("Failed to update sub-activity:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update portal item",
        variant: "destructive",
      });
    }
  };

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await updateSubActivityMutation(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter transaction types to only show the one that matches parent activity
  const allowedTransactionTypes = transactionTypes.filter(
    (tt) => tt._id === parentActivity.activityTransactionType
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Edit Portal Item</h2>
      <p className="text-sm text-gray-500 mb-6">
        Update the details for the portal item. All fields are required unless
        specified.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* First Row: Activity and Transaction Type */}
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="activity"
              disabled
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Activity
                  </FormLabel>
                  <FormControl>
                    <Input className="h-12 bg-gray-50" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionType"
              disabled
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Transaction Type
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 bg-gray-50"
                      value={
                        allowedTransactionTypes.find(
                          (tt) => tt._id === field.value
                        )?.name || ""
                      }
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Second Row: Finance Effect and Pricing Method */}
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="financeEffect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Finance Effect
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Pricing Method
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Per Location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="perLocation">Per Location</SelectItem>
                      <SelectItem value="perItem">Per Item</SelectItem>
                      <SelectItem value="perTrip">Per Trip</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Third Row: Portal Item Names */}
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="portalItemNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Portal Item Name (English)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      placeholder="Document Review"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="portalItemNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Portal Item Name (Arabic)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      placeholder="مراجعة المستندات"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Settings Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="usedByFinance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal leading-none">
                        Used by Finance
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inShippingUnit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal leading-none">
                        In Shipping Unit
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialRequirement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal leading-none">
                        Special Requirement
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="usedByOperations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal leading-none">
                        Used by Operations
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal leading-none">
                        Active
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 mt-8 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-black hover:bg-gray-800 text-white"
            >
              {isSubmitting ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
