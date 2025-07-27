import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocations } from "@/hooks/useLocations";
import {
  SearchableDropdown,
  SearchableDropdownOption,
} from "@/components/ui/searchable-dropdown";
import { Location } from "@/types/types";
import { getStructuredAddress } from "@/utils/getStructuredAddress";

interface LocationDropdownProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  useAddressString?: boolean; // New prop to control whether to send _id or address string
}

export function LocationDropdown({
  value,
  onValueChange,
  placeholder = "Select location...",
  disabled = false,
  className,
  useAddressString = false, // Default to using _id
}: LocationDropdownProps) {
  const { locations, loading, error, pagination, getLocations, clearError } =
    useLocations();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasInitialized = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const getLocationsRef = useRef(getLocations);

  // Update the ref when getLocations changes
  useEffect(() => {
    getLocationsRef.current = getLocations;
  }, [getLocations]);

  // Convert locations to dropdown options
  const locationOptions: SearchableDropdownOption[] = allLocations.map(
    (location) => {
      const address = getStructuredAddress(location);
      return {
        value: useAddressString ? address.en : location._id, // Use address string or _id based on prop
        label: `${address.en}`,
        description: `${address.ar} | ${
          location.isActive ? "Active" : "Inactive"
        }`,
      };
    }
  );

  // Load initial locations on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      getLocationsRef.current(1, 30, { search: "", isActive: true });
    }
  }, []);

  // Update locations when API response changes
  useEffect(() => {
    if (locations && locations.length > 0) {
      if (currentPage === 1) {
        // First page or search reset - replace all locations
        setAllLocations(locations);
      } else {
        // Subsequent pages - append new locations
        setAllLocations((prev) => {
          const existingIds = new Set(prev.map((l) => l._id));
          const newLocations = locations.filter((l) => !existingIds.has(l._id));
          return [...prev, ...newLocations];
        });
      }
    } else if (locations && locations.length === 0 && currentPage === 1) {
      // Clear locations when search returns no results
      setAllLocations([]);
    }

    // Reset loading more state
    if (currentPage > 1) {
      setIsLoadingMore(false);
    }
  }, [locations, currentPage, searchTerm]);

  // Reset loading more state on error
  useEffect(() => {
    if (error && currentPage > 1) {
      setIsLoadingMore(false);
    }
  }, [error, currentPage]);

  // Handle search term changes with debounce
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Don't search if term is empty and we already have initial data
    if (searchTerm === "" && allLocations.length > 0 && currentPage === 1) {
      return;
    }

    // Set up debounced search
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      setAllLocations([]);
      getLocationsRef.current(1, 30, { search: searchTerm, isActive: true });
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]); // Only depend on searchTerm

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    setCurrentPage(nextPage);
    getLocationsRef.current(nextPage, 30, {
      search: searchTerm,
      isActive: true,
    });
  }, [currentPage, pagination, searchTerm, isLoadingMore]);

  // Handle search change
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  // Check if there are more pages to load
  const hasMore = pagination
    ? currentPage < pagination.totalPages && !isLoadingMore
    : false;

  return (
    <SearchableDropdown
      options={locationOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search by location name..."
      emptyMessage="No locations found."
      loading={loading && currentPage === 1}
      disabled={disabled}
      className={className}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
    />
  );
}
