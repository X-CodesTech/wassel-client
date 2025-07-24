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
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

type TCreatePriceListDialogProps = {
  vendorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().min(1),
  descriptionAr: z.string().min(1),
  effectiveFrom: z.string(),
  effectiveTo: z.string(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const CreatePriceListDialog = ({
  vendorId,
  open,
  onOpenChange,
}: TCreatePriceListDialogProps) => {
  const dispatch = useAppDispatch();
  const { createPriceListLoading } = useAppSelector((state) => state.vendors);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      effectiveFrom: new Date().toISOString(),
      effectiveTo: new Date().toISOString(),
      isActive: true,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    dispatch(
      actCreateVendorPriceList({ ...data, vendorId, subActivityPrices: [] })
    )
      .unwrap()
      .catch((error) => {
        if (error.message) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An unknown error occurred",
            variant: "destructive",
          });
        }
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Price list created successfully",
        });
        onOpenChange(false);
        dispatch(actGetVendorPriceLists(vendorId));
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price List</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <DialogDescription>
            <div className="flex flex-col gap-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPriceListLoading === "pending"}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createPriceListLoading === "pending"}
            >
              Create
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePriceListDialog;
