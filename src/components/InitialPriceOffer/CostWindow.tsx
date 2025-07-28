import React from "react";
import { VendorCostData, VendorCostRange } from "@/services/vendorCostServices";

interface CostWindowProps {
  vendorData: VendorCostData[];
  costRange: VendorCostRange;
  customerPrice?: number;
  loading?: boolean;
}

export const CostWindow: React.FC<CostWindowProps> = ({
  vendorData,
  costRange,
  customerPrice,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="relative w-full h-12 bg-gray-100 rounded-lg p-1 border">
        <div className="animate-pulse flex items-center justify-center h-full">
          <span className="text-xs text-gray-500">Loading vendors...</span>
        </div>
      </div>
    );
  }

  if (!vendorData.length) {
    return (
      <div className="relative w-full h-12 bg-gray-50 rounded-lg p-1 border">
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-gray-500">No vendors available</span>
        </div>
      </div>
    );
  }

  const { min, max, average } = costRange;
  const range = max - min;

  // Calculate position percentage for each vendor
  const getVendorPosition = (cost: number) => {
    if (range === 0) return 50; // If all costs are the same
    return ((cost - min) / range) * 100;
  };

  // Get display color based on cost position
  const getCostColor = (cost: number) => {
    const position = getVendorPosition(cost);
    if (position <= 33) return "text-green-600";
    if (position <= 66) return "text-yellow-600";
    return "text-red-600";
  };

  // Calculate savings percentage relative to customer price
  const getSavingsPercent = (cost: number) => {
    if (!customerPrice || customerPrice === 0) return 0;
    return Math.round(((customerPrice - cost) / customerPrice) * 100);
  };

  return (
    <div className="relative w-full h-12 bg-gray-50 rounded-lg p-1 border">
      {/* Gradient Bar */}
      <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full mt-1 shadow-sm"></div>

      {/* Customer Price Reference Line (if provided) */}
      {customerPrice && (
        <>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-blue-600 shadow-sm"></div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600 bg-white px-1 rounded whitespace-nowrap">
            ${customerPrice}
          </div>
        </>
      )}

      {/* Vendor Markers */}
      {vendorData.slice(0, 4).map((vendor, index) => {
        const position = getVendorPosition(vendor.cost);
        const savings = getSavingsPercent(vendor.cost);

        return (
          <React.Fragment key={vendor.vendor}>
            {/* Vendor Line */}
            <div
              className="absolute top-0 w-0.5 h-6 bg-gray-800 shadow-sm"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            ></div>

            {/* Vendor Info Box */}
            <div
              className="absolute top-6 text-xs text-center w-[50px] bg-white rounded p-1 shadow-sm border"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={`text-xs font-medium ${getCostColor(vendor.cost)}`}
              >
                {savings > 0
                  ? `${savings}%`
                  : savings < 0
                  ? `${Math.abs(savings)}%`
                  : "0%"}
              </div>
              <div className="text-xs font-bold">${vendor.cost}</div>
              <div
                className="text-xs font-bold text-blue-600 truncate"
                title={vendor.vendAccount}
              >
                {vendor.vendAccount}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Average Line (optional) */}
      {range > 0 && (
        <>
          <div
            className="absolute top-0 w-px h-6 bg-purple-500 opacity-50"
            style={{
              left: `${getVendorPosition(average)}%`,
              transform: "translateX(-50%)",
            }}
          ></div>
          <div
            className="absolute top-6 text-xs font-medium text-purple-600 bg-purple-50 px-1 rounded whitespace-nowrap"
            style={{
              left: `${getVendorPosition(average)}%`,
              transform: "translateX(-50%)",
            }}
          >
            Avg: ${average}
          </div>
        </>
      )}
    </div>
  );
};
