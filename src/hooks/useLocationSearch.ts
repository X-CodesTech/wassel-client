import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import locationServices from "@/services/locationServices";
import { getStructuredAddress } from "@/utils/getStructuredAddress";

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

        console.log("🔍 Fetching locations:", { page, search, append });

        // Use the existing locationServices
        const filters = search ? { search } : undefined;
        const response = await locationServices.getLocations(page, 20, filters);

        console.log("📦 API Response:", response);

        if (append) {
          setRecords((prev) => {
            const newRecords = [...prev, ...response.data.locations];
            console.log("📝 Appending records. Total:", newRecords.length);
            return newRecords;
          });
        } else {
          console.log(
            "📝 Setting records:",
            response.data.locations?.length || 0
          );
          setRecords(response.data.locations || []);
        }

        setPagination({
          page: response.data.page || page,
          limit: response.data.limit || 20,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || 0,
        });

        setIsInitialized(true);
        console.log("✅ Initialization complete");
      } catch (error: any) {
        console.error("❌ Fetch locations error:", error);
      } finally {
        setLoading(false);
        console.log("🏁 Loading finished");
      }
    },
    []
  );

  // Initialize data when triggered - this is called when dropdown opens
  const initializeData = useCallback(() => {
    console.log("🚀 Initialize data called:", {
      initCalled: initCalledRef.current,
      isInitialized,
      loading,
    });

    // Prevent multiple calls for the same instance
    if (initCalledRef.current || isInitialized || loading) {
      console.log("⛔ Initialize blocked");
      return;
    }

    initCalledRef.current = true;
    console.log("✨ Starting first fetch");
    fetchLocations(1, "");
  }, [isInitialized, loading, fetchLocations]);

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

    console.log("📊 Computed values:", {
      totalRecords: records.length,
      filteredRecords: filteredRecords.length,
      searchQuery: searchQuery.trim(),
      hasMore: pagination.totalPages > pagination.page,
    });

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

    console.log("🔍 Search effect triggered:", {
      query: debouncedSearchQuery,
      currentRecords: records.length,
      hasMore: pagination.totalPages > pagination.page,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
    });

    if (debouncedSearchQuery.trim()) {
      // First check if we have any client-side filtered results
      const clientFilteredResults = records.filter((location) => {
        const address = getStructuredAddress(location).en.toLowerCase();
        const searchTerm = debouncedSearchQuery.toLowerCase();
        return address.includes(searchTerm);
      });

      console.log("🔍 Client-side filtering results:", {
        clientFiltered: clientFilteredResults.length,
        hasMorePages: pagination.totalPages > pagination.page,
      });

      // Only fire API request if:
      // 1. No client-side filtered results AND
      // 2. There are more pages to load
      if (
        clientFilteredResults.length === 0 &&
        pagination.totalPages > pagination.page
      ) {
        console.log(
          "🚀 Firing search request - no local results and more pages available"
        );
        fetchLocations(1, debouncedSearchQuery.trim(), false);
      } else if (clientFilteredResults.length > 0) {
        console.log(
          "✅ Using client-side filtered results:",
          clientFilteredResults.length
        );
      } else {
        console.log("⛔ Search blocked - no more pages to load");
      }
    } else if (debouncedSearchQuery === "") {
      // When search is cleared, we don't need to reload if we have the initial data
      if (records.length === 0) {
        console.log("🔄 Reloading data after search clear - no records");
        fetchLocations(1, "", false);
      } else {
        console.log("✅ Search cleared - showing all existing records");
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
    console.log("🔽 Load more called:", {
      isInitialized,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      hasMore: pagination.totalPages > pagination.page,
      loading,
      allRecordsCount: records.length,
    });

    if (!isInitialized) {
      // If not initialized yet, initialize first
      console.log("🎬 Load more: initializing first");
      initializeData();
      return;
    }

    // Simple logic: load more if there are more pages available
    if (pagination.totalPages > pagination.page && !loading) {
      const nextPage = pagination.page + 1;
      console.log(`📄 Loading page ${nextPage} of ${pagination.totalPages}`);
      fetchLocations(nextPage, searchQuery.trim(), true);
    } else {
      console.log("⛔ Load more blocked:", {
        hasMorePages: pagination.totalPages > pagination.page,
        notLoading: !loading,
        reason: loading ? "Already loading" : "No more pages",
      });
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

    // Computed properties
    hasMore: computedValues.hasMore,
    isEmpty: computedValues.isEmpty,
    canLoadMore: computedValues.canLoadMore,
  };
};
