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
import CustomerDetailsImportExcelPriceListDialog from "./CustomerDetailsDialogs/CustomerDetailsImportExcelPriceListDialog";

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

  const { selectedCustomer } = useAppSelector((state) => state.customers);
  const customerId = selectedCustomer?._id!;
  const customerName = selectedCustomer?.custName;

  const handleImportPriceList = () => {
    dispatch({ type: "importing/modalOpen", payload: true });
  };

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

      <CustomerDetailsImportExcelPriceListDialog
        open={state.importing.modalOpen}
        onOpenChange={(open) =>
          dispatch({ type: "importing/modalOpen", payload: open })
        }
        disabled={state.importing.loading === "pending"}
        loading={state.importing.loading}
      />
    </>
  );
};

export default CustomerDetailsPriceListActions;
