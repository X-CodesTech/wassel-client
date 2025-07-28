import React from "react";
import { VendorCostData } from "@/services/vendorCostServices";

interface VendorDropdownProps {
  vendorData: VendorCostData[];
  selectedVendor?: string;
  onVendorChange: (vendorId: string, cost: number) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const VendorDropdown: React.FC<VendorDropdownProps> = ({
  vendorData,
  selectedVendor,
  onVendorChange,
  loading = false,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = event.target.value;
    if (!vendorId) {
      onVendorChange("", 0);
      return;
    }

    const vendor = vendorData.find((v) => v.vendor === vendorId);
    if (vendor) {
      onVendorChange(vendorId, vendor.cost);
    }
  };

  if (loading) {
    return (
      <select
        className="w-full p-1 text-xs border rounded-md bg-gray-100"
        disabled
      >
        <option>Loading vendors...</option>
      </select>
    );
  }

  return (
    <select
      className="w-full p-1 text-xs border rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      value={selectedVendor || ""}
      onChange={handleChange}
      disabled={disabled || !vendorData.length}
    >
      <option value="">Select Vendor</option>
      {vendorData.map((vendor) => (
        <option key={vendor.vendor} value={vendor.vendor}>
          {vendor.vendorName} - ${vendor.cost}
        </option>
      ))}
    </select>
  );
};
