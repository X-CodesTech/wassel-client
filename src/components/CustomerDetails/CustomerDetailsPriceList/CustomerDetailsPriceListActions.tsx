import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAppSelector } from "@/hooks/useAppSelector";
import { customerServices } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileSpreadsheet,
  Import,
  Loader2,
  LucideDownloadCloud,
  Upload,
  X,
} from "lucide-react";
import { useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type TLoading = "idle" | "pending" | "fulfilled" | "rejected";

const initialState = {
  importing: {
    modalOpen: false,
    loading: "idle" as TLoading,
    error: null,
    response: null,
  },
  exporting: {
    loading: "idle" as TLoading,
    error: null,
    response: null,
  },
};

const reducer = (state: typeof initialState, action: any) => {
  switch (action.type) {
    case "importing/modalOpen":
      return {
        ...state,
        importing: { ...state.importing, modalOpen: action.payload },
      };
    case "exporting/modalOpen":
      return {
        ...state,
        exporting: { ...state.exporting, modalOpen: action.payload },
      };
    case "importing/loading":
      return {
        ...state,
        importing: { ...state.importing, loading: action.payload },
      };
    case "exporting/loading":
      return {
        ...state,
        exporting: { ...state.exporting, loading: action.payload },
      };
    case "importing/error":
      return {
        ...state,
        importing: { ...state.importing, error: action.payload },
      };
    case "exporting/error":
      return {
        ...state,
        exporting: { ...state.exporting, error: action.payload },
      };
    case "importing/response":
      return {
        ...state,
        importing: { ...state.importing, response: action.payload },
      };
    case "exporting/response":
      return {
        ...state,
        exporting: { ...state.exporting, response: action.payload },
      };
    default:
      return state;
  }
};

const CustomerDetailsPriceListActions = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const { selectedCustomer } = useAppSelector((state) => state.customers);
  const customerId = selectedCustomer?._id!;
  const customerName = selectedCustomer?.custName;

  const schema = z.object({
    priceListFile: z.instanceof(File),
  });

  type TCustomerPriceListUploadData = z.infer<typeof schema>;

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
        form.setValue("priceListFile", e.dataTransfer.files as any);
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
      setSelectedFileName(file.name);
    }
  };

  const clearFile = () => {
    form.setValue("priceListFile", undefined as any);
    setSelectedFileName("");
  };

  const handleImportPriceList = () => {};

  const handleExportPriceList = async (isActive: boolean) => {
    if (state.exporting.loading === "pending") return;
    dispatch({ type: "exporting/loading", payload: "pending" });
    try {
      const response = await customerServices.exportCustomerPriceList({
        customerId,
        isActive,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${customerName}-${
        isActive ? "active" : "inactive"
      }-price-list.xlsx`;
      a.click();
      dispatch({ type: "exporting/loading", payload: "fulfilled" });
    } catch (error) {
      dispatch({ type: "exporting/loading", payload: "rejected" });
      dispatch({ type: "exporting/error", payload: error });
      toast({
        title: "Error",
        description: "Failed to export price list",
      });
    }
  };

  const onSubmit = async (data: TCustomerPriceListUploadData) => {
    console.log(data);
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={handleImportPriceList}
          disabled={state.importing.loading === "pending"}
        >
          <Import className="h-4 w-4 mr-2" />
          Import Price List
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={state.exporting.loading === "pending"}
          onClick={() => handleExportPriceList(true)}
        >
          {state.exporting.loading === "pending" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LucideDownloadCloud className="h-4 w-4 mr-2" />
          )}
          Export Price List
        </Button>
      </div>
      <Dialog
        open={state.importing.modalOpen}
        onOpenChange={(open: boolean) =>
          dispatch({ type: "importing/modalOpen", payload: open })
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Price List</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Import a price list from an Excel file. The file must contain a
            sheet named "Upload" with pricing data starting from row 9.
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
                                      field.onChange(e.target.files);
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
                  state.importing.loading === "pending" ||
                  !form.formState.isValid
                }
                onClick={form.handleSubmit(onSubmit)}
              >
                {state.importing.loading === "pending" ? (
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
    </>
  );
};

export default CustomerDetailsPriceListActions;
