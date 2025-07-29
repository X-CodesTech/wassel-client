import React from "react";
import { VendorDropdown as DesignSystemVendorDropdown } from "@/components/ui/vendor-dropdown";
import { VendorCostData } from "@/services/vendorCostServices";

interface VendorDropdownProps {
  vendorData: VendorCostData[];
  selectedVendor?: string;
  onVendorChange: (vendorId: string, cost: number) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const VendorDropdown: React.FC<VendorDropdownProps> = (props) => {
  return <DesignSystemVendorDropdown {...props} />;
};
