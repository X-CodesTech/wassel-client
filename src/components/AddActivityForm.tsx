import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Switch } from "@/components/ui/switch";

// Form validation schema
const formSchema = z.object({
  actSrl: z.string().min(1, "ACTsrl is required"),
  activityCode: z.string().min(1, "Activity Code is required"),
  activityName: z.string().min(1, "Activity Name is required"),
  activityType: z.string().min(1, "Activity Type is required"),
  isWithItems: z.boolean(),
  financeEffect: z.string(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddActivityFormProps {
  onClose: () => void;
}

export default function AddActivityForm({ onClose }: AddActivityFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actSrl: "",
      activityCode: "",
      activityName: "",
      activityType: "X-work",
      isWithItems: true,
      financeEffect: "Yes (Positive)",
      active: true,
    },
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest("POST", "/api/activities", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Success",
        description: "Activity added successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add activity: ${error}`,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  // Submit handler
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    addActivityMutation.mutate(values);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="actSrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ACTsrl</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. X01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. PKGN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="activityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Packaging" {...field} />
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
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="X-work">X-work</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isWithItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is with Items</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "yes")} 
                    defaultValue={field.value ? "yes" : "no"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="financeEffect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finance Effect</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes (Positive)">Yes (Positive)</SelectItem>
                      <SelectItem value="Yes (Negative)">Yes (Negative)</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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
