import React, { useCallback, useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import locationServices from "@/services/locationServices";
import { LocationsResponse, Location } from "@/types/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations";

interface AsyncLocationSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  useAddressString?: boolean;
}

export function AsyncLocationSelect({
  value,
  onValueChange,
  placeholder = "Select location...",
  disabled = false,
  className,
  useAddressString = false,
}: AsyncLocationSelectProps) {
  const dispatch = useAppDispatch();
  const { records } = useAppSelector((state) => state.locations);

  // Helper function to check if location matches search term
  const locationMatchesSearch = (location: Location, searchTerm: string) => {
    const searchLower = searchTerm.toLowerCase();
    const structuredAddress = getStructuredAddress(location).en.toLowerCase();

    return structuredAddress.includes(searchLower);
  };

  // Load options function for AsyncPaginate
  const loadOptions = useCallback(
    async (searchInputValue: string) => {
      // First, filter local options from Redux records
      const filteredLocalOptions = records
        .filter((location) => locationMatchesSearch(location, searchInputValue))
        .map((location) => ({
          value: useAddressString
            ? getStructuredAddress(location).en
            : location._id,
          label: getStructuredAddress(location).en,
        }));

      // If we have local options, return them
      if (filteredLocalOptions.length > 0) {
        return {
          options: filteredLocalOptions,
          hasMore: false,
        };
      }

      // If no local options found, perform API search
      try {
        const response = await locationServices.getLocations(1, 999999, {
          search: searchInputValue,
        });

        const locationsData: LocationsResponse = response.data;

        // Filter API results as well to ensure proper filtering
        const filteredApiOptions = locationsData.locations
          .filter((location) =>
            locationMatchesSearch(location, searchInputValue)
          )
          .map((location) => ({
            value: useAddressString
              ? getStructuredAddress(location).en
              : location._id,
            label: getStructuredAddress(location).en,
          }));

        return {
          options: filteredApiOptions,
          hasMore: locationsData.totalPages > 1,
        };
      } catch (error) {
        console.error("Error loading locations:", error);
        return {
          options: [],
          hasMore: false,
        };
      }
    },
    [records, useAddressString]
  );

  // Load initial locations only if records are empty
  useEffect(() => {
    if (records.length === 0) {
      dispatch(
        actGetLocations({
          page: 1,
          limit: 999999,
          filters: {},
        })
      );
    }
  }, [dispatch, records.length]);

  return (
    <AsyncPaginate
      styles={{
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        menuList: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      value={
        value
          ? {
              value: value,
              label: value, // This will be updated when we have the actual location data
            }
          : null
      }
      maxMenuHeight={200}
      onChange={(option) => onValueChange(option?.value || "")}
      loadOptions={loadOptions}
      placeholder={placeholder}
      isClearable
      isSearchable
      isDisabled={disabled}
      className={className}
    />
  );
}
