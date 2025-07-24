import React, { useState, useEffect, useCallback } from "react";
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
  // Remove: const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  // Load initial locations
  useEffect(() => {
    getLocations(1, 30, {});
  }, []);

  // Update locations when API response changes
  useEffect(() => {
    if (locations && locations.length > 0) {
      if (currentPage === 1) {
        setAllLocations(locations);
      } else {
        setAllLocations((prev) => {
          // Merge new locations, avoiding duplicates
          const existingIds = new Set(prev.map((l) => l._id));
          const newLocations = locations.filter((l) => !existingIds.has(l._id));
          return [...prev, ...newLocations];
        });
      }
    }
    // Reset loading more state when locations are updated
    if (currentPage > 1) {
      setIsLoadingMore(false);
    }
  }, [locations, currentPage]);

  // Reset loading more state on error
  useEffect(() => {
    if (error && currentPage > 1) {
      setIsLoadingMore(false);
    }
  }, [error, currentPage]);

  // Handle search
  useEffect(() => {
    if (searchTerm === "") return;
    setCurrentPage(1);
    setAllLocations([]);
    const filters = searchTerm
      ? {
          search: searchTerm,
        }
      : {};
    getLocations(1, 30, filters);
  }, [searchTerm, getLocations]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) {
      return;
    }
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    setCurrentPage(nextPage);
    const filters = searchTerm
      ? {
          search: searchTerm,
        }
      : {};
    getLocations(nextPage, 30, filters);
  }, [currentPage, pagination, getLocations, searchTerm, isLoadingMore]);

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
      searchPlaceholder="Search by country, area, or city..."
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
