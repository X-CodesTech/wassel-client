import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { Activity } from "@/types/types";
import { useAppSelector } from "@/hooks/useAppSelector";
import { subActivityServices } from "@/services";

// Form validation schema matching the new design
const formSchema = z.object({
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
  portalItemNameEn: z.string().min(1, "Portal item name (English) is required"),
  portalItemNameAr: z.string().min(1, "Portal item name (Arabic) is required"),
  usedByFinance: z.boolean(),
  usedByOperations: z.boolean(),
  inShippingUnit: z.boolean(),
  active: z.boolean(),
  specialRequirement: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSubActivityFormProps {
  parentActivity: Activity;
  onClose: () => void;
}

export default function AddSubActivityForm({
  parentActivity,
  onClose,
}: AddSubActivityFormProps) {
  const { records: transactionTypes } = useAppSelector(
    (state) => state.transactionTypes
  );

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter transaction types to only show the one that matches parent activity
  const allowedTransactionTypes = transactionTypes.filter(
    (tt) => tt._id === parentActivity.activityTransactionType
  );

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: parentActivity._id!,
      activity: parentActivity.actSrl || "",
      transactionType: parentActivity.activityTransactionType || "",
      financeEffect: "none",
      pricingMethod: "perLocation",
      portalItemNameEn: "",
      portalItemNameAr: "",
      usedByFinance: false,
      usedByOperations: false,
      inShippingUnit: false,
      active: false,
      specialRequirement: false,
    },
  });

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data } = await subActivityServices.addSubActivity(
        parentActivity._id!,
        {
          activity: parentActivity._id!,
          financeEffect: values.financeEffect,
          pricingMethod: values.pricingMethod,
          portalItemNameEn: values.portalItemNameEn,
          isActive: values.active,
          isInShippingUnit: values.inShippingUnit,
          isInSpecialRequirement: values.specialRequirement,
          isUsedByFinance: values.usedByFinance,
          isUsedByOps: values.usedByOperations,
          portalItemNameAr: values.portalItemNameAr,
          transactionType: parentActivity.activityTransactionType, // Send just the ID string
        } as any // API expects string IDs, not full objects
      );

      toast({
        title: "Success",
        description: "Portal item added successfully",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add portal item: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Add New Portal Item</h2>
      <p className="text-sm text-gray-500 mb-6">
        Fill in the details for the new portal item. All fields are required
        unless specified.
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
                    <Input className="h-12" {...field} />
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
                    <Input className="h-12" {...field} />
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
              // disabled={loading === "pending"}
              className="px-6"
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
