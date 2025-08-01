import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileSpreadsheet, X, Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { customerServices } from "@/services";
import { useAppSelector } from "@/hooks/useAppSelector";

const schema = z.object({
  priceListFile: z.instanceof(File).optional(),
});

export type TCustomerPriceListUploadData = z.infer<typeof schema>;

type TCustomerDetailsImportExcelPriceListDialog = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogDispatch: React.Dispatch<any>;
  dialogState: any;
};

const CustomerDetailsImportExcelPriceListDialog = ({
  open,
  onOpenChange,
  dialogDispatch,
  dialogState,
}: TCustomerDetailsImportExcelPriceListDialog) => {
  const dispatch = dialogDispatch;
  const state = dialogState;
  const { selectedCustomer } = useAppSelector((state) => state.customers);
  const customerId = selectedCustomer?._id!;

  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const form = useForm<TCustomerPriceListUploadData>({
    defaultValues: {
      priceListFile: undefined,
    },
    resolver: zodResolver(schema),
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        form.setValue("priceListFile", file);
        setSelectedFileName(file.name);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("priceListFile", file);
      setSelectedFileName(file.name);
    }
  };

  const clearFile = () => {
    form.setValue("priceListFile", undefined);
    setSelectedFileName("");
  };

  const onSubmit = async (data: TCustomerPriceListUploadData) => {
    dispatch({ type: "importing/loading", payload: "pending" });
    try {
      const formData = new FormData();

      // Append the file
      if (data.priceListFile) {
        formData.append("priceListFile", data.priceListFile);
      }

      await customerServices.importCustomerPriceList({
        customerId,
        formData,
      });

      dispatch({ type: "importing/loading", payload: "fulfilled" });
      dispatch({ type: "importing/modalOpen", payload: false });
      toast({
        title: "Success",
        description: "Price list imported successfully",
      });

      // Reset form
      form.reset();
      setSelectedFileName("");
    } catch (error) {
      dispatch({ type: "importing/loading", payload: "rejected" });
      dispatch({ type: "importing/error", payload: error });
      toast({
        title: "Error",
        description: "Failed to import price list",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Price List</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Import a price list from an Excel file. The file must contain a sheet
          named "Upload" with pricing data starting from row 9.
        </DialogDescription>
        <Form {...form}>
          <div className="space-y-4">
            {/* Enhanced Excel File Upload */}
            <FormField
              control={form.control}
              name="priceListFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel File *
                  </FormLabel>
                  <FormControl>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      } ${
                        selectedFileName ? "bg-green-50 border-green-300" : ""
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {selectedFileName ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {selectedFileName}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearFile}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Drop your Excel file here, or{" "}
                              <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                                browse
                                <Input
                                  type="file"
                                  accept=".xlsx,.xls"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleFileChange(e);
                                  }}
                                />
                              </label>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports .xlsx and .xls files
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                state.loading === "pending" ||
                !form.watch("priceListFile") ||
                state.disabled
              }
              onClick={form.handleSubmit(onSubmit)}
            >
              {state.loading === "pending" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsImportExcelPriceListDialog;
