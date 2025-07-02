import { useAppSelector } from "./useAppSelector";
import {
  actGetVendors,
  actSyncVendors,
  clearVendorsError,
  clearVendorsData,
  clearSyncError,
  clearSyncStats,
} from "@/store/vendors";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { VendorFilters } from "@/types/types";

export const useVendors = () => {
  const dispatch = useDispatch();
  const {
    records,
    loading,
    error,
    pagination,
    syncLoading,
    syncError,
    syncStats,
  } = useAppSelector((state) => state.vendors);

  const getVendors = useCallback(
    (filters?: VendorFilters) => {
      dispatch(actGetVendors(filters || {}));
    },
    [dispatch]
  );

  const syncVendors = useCallback(() => {
    dispatch(actSyncVendors());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearVendorsError());
  }, [dispatch]);

  const clearData = useCallback(() => {
    dispatch(clearVendorsData());
  }, [dispatch]);

  const clearSyncErrorHandler = useCallback(() => {
    dispatch(clearSyncError());
  }, [dispatch]);

  const clearSyncStatsHandler = useCallback(() => {
    dispatch(clearSyncStats());
  }, [dispatch]);

  return {
    records,
    loading,
    error,
    pagination,
    syncLoading,
    syncError,
    syncStats,
    getVendors,
    syncVendors,
    clearError,
    clearData,
    clearSyncError: clearSyncErrorHandler,
    clearSyncStats: clearSyncStatsHandler,
  };
};
