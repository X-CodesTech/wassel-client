import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import locationServices from "@/services/locationServices";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { useAppSelector } from "@/hooks/useAppSelector";

type Location = {
  _id: string;
  country: string;
  countryAr: string;
  area: string;
  areaAr: string;
  city: string;
  cityAr: string;
  village: string;
  villageAr: string;
  isActive: boolean;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
};

type PaginationState = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
};

export const useLocationSearch = () => {
  // Get locations from Redux store as fallback
  const reduxLocations = useAppSelector((state) => state.locations.records);

  // Local state - completely independent from Redux
  const [records, setRecords] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    limit: 10,
    totalPages: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const lastSearchRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const initCalledRef = useRef(false); // Track if init was called to prevent floods

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch locations function
  const fetchLocations = useCallback(
    async (page: number = 1, search: string = "", append: boolean = false) => {
      try {
        setLoading(true);

        // Use the existing locationServices
        const filters = search ? { search } : undefined;

        const response = await locationServices.getLocations(page, 20, filters);

        if (append) {
          setRecords((prev) => {
            const newRecords = [...prev, ...response.data.locations];
            return newRecords;
          });
        } else {
          setRecords(response.data.locations || []);
        }

        setPagination({
          page: response.data.page || page,
          limit: response.data.limit || 20,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || 0,
        });

        setIsInitialized(true);
      } catch (error: any) {
        // Fallback to Redux locations if API fails
        if (reduxLocations.length > 0) {
          setRecords(reduxLocations);
          setIsInitialized(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [reduxLocations]
  );

  // Initialize data when triggered - this is called when dropdown opens
  const initializeData = useCallback(() => {
    // Prevent multiple calls for the same instance
    if (initCalledRef.current || isInitialized || loading) {
      return;
    }

    // If we have Redux locations available, use them first
    if (reduxLocations.length > 0) {
      setRecords(reduxLocations);
      setIsInitialized(true);
      initCalledRef.current = true;
      return;
    }

    initCalledRef.current = true;
    fetchLocations(1, "");
  }, [isInitialized, loading, fetchLocations, reduxLocations]);

  // Memoized computed properties to prevent unnecessary re-renders
  const computedValues = useMemo(() => {
    // Client-side filtering of existing records
    const filteredRecords = searchQuery.trim()
      ? records.filter((location) => {
          const address = getStructuredAddress(location).en.toLowerCase();
          const searchTerm = searchQuery.toLowerCase();
          return address.includes(searchTerm);
        })
      : records;

    return {
      filteredRecords,
      hasMore: pagination.totalPages > pagination.page,
      isEmpty: !filteredRecords.length && !loading && isInitialized,
      canLoadMore: !records.length && pagination.totalPages > pagination.page, // Use total records, not filtered
    };
  }, [
    records,
    searchQuery,
    pagination.totalPages,
    pagination.page,
    loading,
    isInitialized,
  ]);

  // Handle search when debounced query changes
  useEffect(() => {
    // Only search if component has been initialized
    if (!isInitialized) return;

    // Avoid redundant requests
    if (lastSearchRef.current === debouncedSearchQuery) return;

    lastSearchRef.current = debouncedSearchQuery;

    if (debouncedSearchQuery.trim()) {
      // First check if we have any client-side filtered results
      const clientFilteredResults = records.filter((location) => {
        const address = getStructuredAddress(location).en.toLowerCase();
        const searchTerm = debouncedSearchQuery.toLowerCase();
        return address.includes(searchTerm);
      });

      // Only fire API request if:
      // 1. No client-side filtered results AND
      // 2. There are more pages to load
      if (
        clientFilteredResults.length === 0 &&
        pagination.totalPages > pagination.page
      ) {
        fetchLocations(1, debouncedSearchQuery.trim(), false);
      } else if (clientFilteredResults.length > 0) {
      } else {
      }
    } else if (debouncedSearchQuery === "") {
      // When search is cleared, we don't need to reload if we have the initial data
      if (records.length === 0) {
        fetchLocations(1, "", false);
      }
    }
  }, [
    debouncedSearchQuery,
    isInitialized,
    fetchLocations,
    pagination.totalPages,
    pagination.page,
    records,
  ]);

  // Memoized load more function
  const loadMore = useCallback(() => {
    if (!isInitialized) {
      // If not initialized yet, initialize first
      initializeData();
      return;
    }

    // Simple logic: load more if there are more pages available
    if (pagination.totalPages > pagination.page && !loading) {
      const nextPage = pagination.page + 1;
      fetchLocations(nextPage, searchQuery.trim(), true);
    }
  }, [
    pagination.totalPages,
    pagination.page,
    loading,
    searchQuery,
    records.length,
    isInitialized,
    initializeData,
    fetchLocations,
  ]);

  // Memoized search change handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Initialize data if this is the first search and not initialized
      if (!isInitialized && value.trim()) {
        initializeData();
      }
    },
    [isInitialized, initializeData]
  );

  // Memoized clear search handler
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    lastSearchRef.current = "";

    // Only fetch if already initialized
    if (isInitialized) {
      fetchLocations(1, "", false);
    }
  }, [isInitialized, fetchLocations]);

  // Function to load specific locations by ID (useful for edit mode)
  const loadSpecificLocations = useCallback(async (locationIds: string[]) => {
    if (!locationIds.length) return;

    try {
      setLoading(true);

      // For now, we'll just fetch all locations and filter
      // In a real implementation, you might have an API endpoint to fetch by IDs
      const response = await locationServices.getLocations(1, 1000, {});
      const allLocations = response.data.locations || [];

      // Filter to only include the requested locations
      const requestedLocations = allLocations.filter((location: Location) =>
        locationIds.includes(location._id)
      );

      // Add these locations to our records if they're not already there
      setRecords((prev) => {
        const existingIds = new Set(prev.map((loc) => loc._id));
        const newLocations = requestedLocations.filter(
          (loc) => !existingIds.has(loc._id)
        );
        return [...prev, ...newLocations];
      });
    } catch (error: any) {
      console.error("❌ Load specific locations error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    records: computedValues.filteredRecords, // Return filtered records instead of raw records
    allRecords: records, // Keep original records available if needed
    pagination,
    loading,
    isInitialized,
    userHasInteracted: isInitialized, // Simplified - if initialized, user has interacted

    // Search state
    searchQuery,
    debouncedSearchQuery,

    // Actions
    handleSearchChange,
    loadMore,
    clearSearch,
    initializeData, // Expose for manual initialization
    loadSpecificLocations, // New function for loading specific locations

    // Computed properties
    hasMore: computedValues.hasMore,
    isEmpty: computedValues.isEmpty,
    canLoadMore: computedValues.canLoadMore,
  };
};
