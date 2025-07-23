import { useAppSelector, useAppDispatch } from "./useAppSelector";
import { actGetLocations, clearError } from "@/store/locations";
import { LocationFilters } from "@/types/types";

export const useLocations = () => {
  const dispatch = useAppDispatch();
  const { records, loading, error, pagination } = useAppSelector(
    (state) => state.locations
  );

  const getLocations = (
    page = 1,
    limit = 30,
    filters: LocationFilters = {}
  ) => {
    dispatch(actGetLocations({ filters, page, limit }));
  };

  const clearErrorHandler = () => {
    dispatch(clearError());
  };

  return {
    locations: records,
    loading,
    error,
    pagination,
    getLocations,
    clearError: clearErrorHandler,
  };
};
