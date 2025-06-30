import { useAppSelector, useAppDispatch } from "./useAppSelector";
import {
  actGetCustomers,
  actImportCustomers,
  clearCustomersError,
  clearCustomersData,
  clearImportError as clearImportErrorAction,
} from "@/store/customers";
import { CustomerFilters } from "@/types/types";

export const useCustomers = () => {
  const dispatch = useAppDispatch();
  const {
    records,
    loading,
    error,
    importLoading,
    importError,
    importStats,
    pagination,
  } = useAppSelector((state) => state.customers);

  const getCustomers = (filters: CustomerFilters = {}) => {
    dispatch(actGetCustomers(filters));
  };

  const importCustomers = () => {
    dispatch(actImportCustomers());
  };

  const clearError = () => {
    dispatch(clearCustomersError());
  };

  const clearImportError = () => {
    dispatch(clearImportErrorAction());
  };

  const clearData = () => {
    dispatch(clearCustomersData());
  };

  return {
    customers: records,
    loading,
    error,
    importLoading,
    importError,
    importStats,
    pagination,
    getCustomers,
    importCustomers,
    clearError,
    clearImportError,
    clearData,
  };
};
