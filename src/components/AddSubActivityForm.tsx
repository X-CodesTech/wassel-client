import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Activity, SubActivity } from "@/types/types";
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
import { Switch } from "@/components/ui/switch";

// Form validation schema
const formSchema = z.object({
  parentId: z.number(),
  itmSrl: z.number().int().positive("Item serial must be a positive number"),
  itemCode: z.string().min(1, "Item Code is required"),
  itemName: z.string().min(1, "Item Name is required"),
  activityName: z.string().min(1, "Activity Name is required"),
  activityType: z.string().min(1, "Activity Type is required"),
  pricingMethod: z.string().min(1, "Pricing Method is required"),
  active: z.boolean(),
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current sub-activities to determine next itmSrl
  const { data: activityWithSubs } = useQuery({
    queryKey: ["/api/activities", parentActivity.id, "sub-activities"],
  });

  // Safely access sub-activities from the query response
  const subActivities: SubActivity[] =
    activityWithSubs &&
    typeof activityWithSubs === "object" &&
    activityWithSubs !== null &&
    "subActivities" in activityWithSubs
      ? (activityWithSubs.subActivities as SubActivity[])
      : [];

  // Calculate next itmSrl
  const nextItmSrl =
    subActivities.length > 0
      ? Math.max(...subActivities.map((sub: SubActivity) => sub.itmSrl)) + 1
      : 1;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: parentActivity.id,
      itmSrl: nextItmSrl,
      itemCode: "",
      itemName: "",
      activityName: parentActivity.activityName,
      activityType: parentActivity.activityType,
      pricingMethod: "Fixed",
      active: true,
    },
  });

  // Add sub-activity mutation

  // Submit handler
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Prefix the itmSrl with the parent activity's ACTsrl in the itemCode field to display
    // but keep the numeric itmSrl for the database
    const submissionValues = {
      ...values,
      itmSrl: Number(values.itmSrl),
      itemCode: `${parentActivity.actSrl}-${values.itmSrl}-${values.itemCode}`,
    };
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Add New Sub-Activity</h3>
      <p className="text-sm text-gray-500 mb-4">
        Adding sub-activity to: <strong>{parentActivity.activityName}</strong> (
        {parentActivity.actSrl})
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="itmSrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ITMsrl</FormLabel>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 px-3 py-2 border rounded-l-md text-sm font-medium text-gray-700">
                      {parentActivity.actSrl}-
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        className="rounded-l-none"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || "")
                        }
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="itemCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CRTNNMH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Packaging carton" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="activityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="X-work">X-work</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Transportation">
                        Transportation
                      </SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="pricingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Per item">Per item</SelectItem>
                    <SelectItem value="Per location">Per location</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
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

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
