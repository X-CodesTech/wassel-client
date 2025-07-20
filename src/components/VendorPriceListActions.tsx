import { vendorServices } from "@/services";
import {
  ChevronDown,
  Import,
  Loader2,
  LucideDownloadCloud,
  Plus,
} from "lucide-react";
import { useReducer, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";

type TLoading = "idle" | "pending" | "fulfilled" | "rejected";

const initialState = {
  importing: {
    modalOpen: false,
    loading: "idle" as TLoading,
    error: null,
    response: null,
  },
  exporting: {
    modalOpen: false,
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

export default function VendorPriceListActions({
  handleAddPriceList,
  id,
  vendorName,
}: {
  handleAddPriceList: () => void;
  id: string;
  vendorName: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [importFileDialogOpen, setImportFileDialogOpen] = useState(false);

  const handleImportPriceList = () => {
    console.log("Import Price List");
  };

  const handleExportPriceList = async (isActive: boolean) => {
    if (state.exporting.loading === "pending") return;
    dispatch({ type: "exporting/loading", payload: "pending" });
    try {
      const response = await vendorServices.exportVendorPriceListAsExcel({
        id,
        isActive,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${vendorName}-${
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

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={handleAddPriceList}>
          <Plus className="h-4 w-4 mr-2" />
          Add Price List
        </Button>
        <Button size="sm" variant="outline" onClick={handleImportPriceList}>
          <Import className="h-4 w-4 mr-2" />
          Import Price List
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={state.exporting.loading === "pending"}
            >
              {state.exporting.loading === "pending" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LucideDownloadCloud className="h-4 w-4 mr-2" />
              )}
              Export Price List
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleExportPriceList(true)}
              disabled={state.exporting.loading === "pending"}
            >
              Active Price Lists Only
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExportPriceList(false)}
              disabled={state.exporting.loading === "pending"}
            >
              Inactive Price Lists Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog
        open={importFileDialogOpen}
        onOpenChange={setImportFileDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Price List</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Import a price list from a file.
          </DialogDescription>
          <Input type="file" />
          <Button type="submit">Import</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
