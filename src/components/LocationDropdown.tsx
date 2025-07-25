import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocations } from "@/hooks/useLocations";
import {
  SearchableDropdown,
  SearchableDropdownOption,
} from "@/components/ui/searchable-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Location, LocationFilters } from "@/types/types";
import { getStructuredAddress } from "@/utils/getStructuredAddress";

// Helper function to parse search term into location filters
const parseSearchTerm = (searchTerm: string): LocationFilters => {
  if (!searchTerm.trim()) {
    return {};
  }

  const searchParts = searchTerm
    .trim()
    .split(",")
    .map((part) => part.trim());
  const filters: LocationFilters = {};

  if (searchParts.length >= 1 && searchParts[0]) {
    filters.area = searchParts[0];
  }
  if (searchParts.length >= 2 && searchParts[1]) {
    filters.city = searchParts[1];
  }
  if (searchParts.length >= 3 && searchParts[2]) {
    filters.village = searchParts[2];
  }

  // If no structured search, use the original search parameter
  if (Object.keys(filters).length === 0) {
    filters.search = searchTerm;
  }

  return filters;
};

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
  const [filterValues, setFilterValues] = useState({
    country: "",
    area: "",
    city: "",
    village: "",
  });
  const [activeFilters, setActiveFilters] = useState<LocationFilters>({});
  const hasInitialized = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const getLocationsRef = useRef(getLocations);

  // Update the ref when getLocations changes
  useEffect(() => {
    getLocationsRef.current = getLocations;
  }, [getLocations]);

  // Handle filter input changes
  const handleFilterChange = (
    field: keyof typeof filterValues,
    value: string
  ) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle filter button click
  const handleFilterApply = useCallback(() => {
    const filters: LocationFilters = {};

    if (filterValues.country.trim()) {
      filters.country = filterValues.country.trim();
    }
    if (filterValues.area.trim()) {
      filters.area = filterValues.area.trim();
    }
    if (filterValues.city.trim()) {
      filters.city = filterValues.city.trim();
    }
    if (filterValues.village.trim()) {
      filters.village = filterValues.village.trim();
    }

    setActiveFilters(filters);
    setCurrentPage(1);
    setAllLocations([]);
    setSearchTerm(""); // Clear search term when applying filters

    getLocationsRef.current(1, 30, filters);
  }, [filterValues]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilterValues({
      country: "",
      area: "",
      city: "",
      village: "",
    });
    setActiveFilters({});
    setCurrentPage(1);
    setAllLocations([]);
    setSearchTerm(""); // Clear search term when clearing filters

    getLocationsRef.current(1, 30, {});
  }, []);

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
      getLocationsRef.current(1, 30, activeFilters);
    }
  }, [activeFilters]);

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

      // Combine active filters with search term
      const searchFilters = parseSearchTerm(searchTerm);
      const combinedFilters = { ...activeFilters, ...searchFilters };

      getLocationsRef.current(1, 30, combinedFilters);
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, activeFilters]); // Depend on both searchTerm and activeFilters

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) {
      return;
    }
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    setCurrentPage(nextPage);

    // Combine active filters with search term
    const searchFilters = parseSearchTerm(searchTerm);
    const combinedFilters = { ...activeFilters, ...searchFilters };

    getLocationsRef.current(nextPage, 30, combinedFilters);
  }, [currentPage, pagination, searchTerm, activeFilters, isLoadingMore]);

  // Handle search change
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  // Check if there are more pages to load
  const hasMore = pagination
    ? currentPage < pagination.totalPages && !isLoadingMore
    : false;

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label htmlFor="country-filter" className="text-xs font-medium">
              Country
            </Label>
            <Input
              id="country-filter"
              placeholder="Enter country"
              value={filterValues.country}
              onChange={(e) => handleFilterChange("country", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="area-filter" className="text-xs font-medium">
              Area
            </Label>
            <Input
              id="area-filter"
              placeholder="Enter area"
              value={filterValues.area}
              onChange={(e) => handleFilterChange("area", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="city-filter" className="text-xs font-medium">
              City
            </Label>
            <Input
              id="city-filter"
              placeholder="Enter city"
              value={filterValues.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="village-filter" className="text-xs font-medium">
              Village
            </Label>
            <Input
              id="village-filter"
              placeholder="Enter village"
              value={filterValues.village}
              onChange={(e) => handleFilterChange("village", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleFilterApply}
            disabled={loading}
            className="text-xs"
          >
            Filter
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleClearFilters}
            disabled={loading}
            className="text-xs"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Dropdown */}
      <SearchableDropdown
        options={locationOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        searchPlaceholder="Search within filtered results..."
        emptyMessage="No locations found."
        loading={loading && currentPage === 1}
        disabled={disabled}
        className={className}
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        showSearch={false}
      />
    </div>
  );
}
