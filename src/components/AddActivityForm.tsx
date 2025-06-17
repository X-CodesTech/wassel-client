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
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actAddActivity } from "@/store/activities/activitiesSlice";

// Form validation schema matching the backend API
const formSchema = z.object({
  actSrl: z.string().min(1, "Activity serial number is required"),
  activityCode: z.string().min(1, "Activity code is required"),
  activityNameEn: z.string().min(1, "Activity (EN) name is required"),
  activityNameAr: z.string().min(1, "Activity (AR) name is required"),
  activityTransactionType: z.string().min(1, "Activity type is required"),
  isWithItems: z.boolean(),
  isActive: z.boolean(),
  // Additional fields for the new form
  portalActivityNameAr: z
    .string()
    .min(1, "Portal Activity name (AR) is required"),
  portalActivityNameEn: z
    .string()
    .min(1, "Portal Activity name (EN) is required"),
  isOpsActive: z.boolean(),
  isInShippingUnit: z.boolean(),
  isPortalActive: z.boolean(),
  isInOrderScreen: z.boolean(),
  isInSpecialRequirement: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddActivityFormProps {
  onClose: () => void;
}

export default function AddActivityForm({ onClose }: AddActivityFormProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.activities);

  const { toast } = useToast();
  const { records } = useAppSelector((state) => state.transactionTypes);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actSrl: "",
      activityCode: "",
      activityNameEn: "",
      activityNameAr: "",
      activityTransactionType: "",
      isWithItems: false,
      isActive: false,
      portalActivityNameAr: "",
      portalActivityNameEn: "",
      isOpsActive: false,
      isInShippingUnit: false,
      isPortalActive: false,
      isInOrderScreen: false,
      isInSpecialRequirement: false,
    },
  });

  // Submit handler
  const onSubmit = (values: FormValues) => {
    dispatch(actAddActivity(values))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Activity added successfully",
        });
        onClose();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add activity",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Define new activity</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <FormField
            control={form.control}
            name="activityTransactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">
                  *Select type of transaction
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="max-w-[250px]">
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={records?.[0]?.name} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {records.map((record) => (
                      <SelectItem key={record._id} value={record._id}>
                        {record.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 1: Serial, Name EN, Name AR */}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="actSrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Activity Serial number
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
              name="activityNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Activity name (En)
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
              name="activityNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Activity name (AR)
                  </FormLabel>
                  <FormControl>
                    <Input className="h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Code, Portal Name AR, Portal Name EN */}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="activityCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Activity code
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
              name="portalActivityNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Portal Activity name (AR)
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
              name="portalActivityNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Portal activity name (EN)
                  </FormLabel>
                  <FormControl>
                    <Input className="h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Checkboxes Grid */}
          <div className="grid grid-cols-3 gap-8 mt-8">
            {/* Column 1 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isWithItems"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Is with items
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isInShippingUnit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Is in shipping unit
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isInSpecialRequirement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Is in special requirement
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isOpsActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Is active in OPS system
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPortalActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Active in portal
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Is active
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isInOrderScreen"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Choose in order screen
                    </FormLabel>
                  </FormItem>
                )}
              />
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
              disabled={loading === "pending"}
              className="px-6"
            >
              {loading === "pending" ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
