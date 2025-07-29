import React from "react";
import { cn } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface VendorCostData {
  vendor: string;
  vendorName: string;
  vendAccount: string;
  priceListId: string;
  priceListName: string;
  cost: number;
}

export interface VendorDropdownProps {
  vendorData: VendorCostData[];
  selectedVendor?: string;
  onVendorChange: (vendorId: string, cost: number) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VendorDropdown({
  vendorData,
  selectedVendor,
  onVendorChange,
  loading = false,
  disabled = false,
  placeholder = "Select Vendor",
  className,
  size = "md",
}: VendorDropdownProps) {
  const handleValueChange = (value: string) => {
    if (!value) {
      onVendorChange("", 0);
      return;
    }
    const vendor = vendorData.find((v) => v.vendor === value);
    if (vendor) {
      onVendorChange(value, vendor.cost);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-full border rounded-md bg-muted",
          sizeClasses[size],
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading vendors...</span>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Select
        value={selectedVendor || ""}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full", sizeClasses[size], className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          className="z-[9999]"
        >
          {vendorData.map((vendor) => (
            <SelectItem key={vendor.vendor} value={vendor.vendor}>
              {vendor.vendorName} - ${vendor.cost.toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
