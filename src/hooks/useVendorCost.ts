import { useState, useEffect, useCallback } from "react";
import {
  vendorCostServices,
  VendorCostResponse,
  VendorCostParams,
} from "@/services/vendorCostServices";

export const useVendorCost = () => {
  const [vendorCostData, setVendorCostData] = useState<
    Record<string, VendorCostResponse>
  >({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const fetchVendorCost = useCallback(
    async (params: VendorCostParams, key: string) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      setError((prev) => ({ ...prev, [key]: "" }));

      try {
        const response = await vendorCostServices.getSubActivityCost(params);
        setVendorCostData((prev) => ({ ...prev, [key]: response }));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch vendor cost data";
        setError((prev) => ({ ...prev, [key]: errorMessage }));
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    []
  );

  const getVendorCostByKey = (key: string) => vendorCostData[key] || null;
  const isLoadingByKey = (key: string) => loading[key] || false;
  const getErrorByKey = (key: string) => error[key] || "";

  return {
    vendorCostData,
    loading,
    error,
    fetchVendorCost,
    getVendorCostByKey,
    isLoadingByKey,
    getErrorByKey,
  };
};
