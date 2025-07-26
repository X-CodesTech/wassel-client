import { useCallback, useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { Location } from "@/types/types";
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
  const [currentLabel, setCurrentLabel] = useState<string>("");

  // Helper function to check if location matches search term
  const locationMatchesSearch = (location: Location, searchTerm: string) => {
    const searchLower = searchTerm.toLowerCase();
    const structuredAddress = getStructuredAddress(location).en.toLowerCase();

    return structuredAddress.includes(searchLower);
  };

  // Load options function for AsyncPaginate
  const loadOptions = useCallback(
    async (searchInputValue: string) => {
      // Filter local options from Redux records
      const filteredLocalOptions = records
        .filter((location) => locationMatchesSearch(location, searchInputValue))
        .map((location) => ({
          value: location._id, // Always use _id as value
          label: getStructuredAddress(location).en,
        }));

      // If we have local options, return them
      if (filteredLocalOptions.length > 0) {
        return {
          options: filteredLocalOptions,
          hasMore: false,
        };
      }

      // If no local options found, dispatch to Redux to fetch more locations
      try {
        await dispatch(
          actGetLocations({
            page: 1,
            limit: 999999,
            filters: { search: searchInputValue },
          })
        );

        // After dispatch, filter the updated records
        const updatedRecords = useAppSelector(
          (state) => state.locations.records
        );
        const filteredUpdatedOptions = updatedRecords
          .filter((location) =>
            locationMatchesSearch(location, searchInputValue)
          )
          .map((location) => ({
            value: location._id, // Always use _id as value
            label: getStructuredAddress(location).en,
          }));

        return {
          options: filteredUpdatedOptions,
          hasMore: false,
        };
      } catch (error) {
        console.error("Error loading locations:", error);
        return {
          options: [],
          hasMore: false,
        };
      }
    },
    [records, useAddressString, dispatch]
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

  // Update current label when value or records change
  useEffect(() => {
    if (!value) {
      setCurrentLabel("");
      return;
    }

    // First check in local records
    const localLocation = records.find((location) =>
      useAddressString
        ? getStructuredAddress(location).en === value
        : location._id === value
    );

    if (localLocation) {
      setCurrentLabel(getStructuredAddress(localLocation).en);
      return;
    }

    // If not found in local records, try to fetch from API
    const fetchLocationLabel = async () => {
      try {
        // If using address string, check if the value is an ID or address string
        if (useAddressString) {
          // Check if the value looks like an ID (24 character hex string)
          const isIdValue = /^[0-9a-fA-F]{24}$/.test(value);

          if (isIdValue) {
            // Value is an ID but we're in address string mode, try to find the location by ID
            // First check if it's already in Redux records
            const existingLocation = records.find((loc) => loc._id === value);

            if (existingLocation) {
              setCurrentLabel(getStructuredAddress(existingLocation).en);
            } else {
              // If not in Redux, dispatch to fetch it
              try {
                await dispatch(
                  actGetLocations({
                    page: 1,
                    limit: 999999,
                    filters: { search: value },
                  })
                );

                // Check again in updated records
                const updatedRecords = useAppSelector(
                  (state) => state.locations.records
                );
                const foundLocation = updatedRecords.find(
                  (loc) => loc._id === value
                );

                if (foundLocation) {
                  setCurrentLabel(getStructuredAddress(foundLocation).en);
                } else {
                  setCurrentLabel(value); // Fallback to value if not found
                }
              } catch (error) {
                console.error("Error fetching location for display:", error);
                setCurrentLabel(value); // Fallback to value on error
              }
            }
          } else {
            // Value is already an address string
            setCurrentLabel(value);
          }
          return;
        }

        // For ID-based selection, try to find the location by ID
        // First check if it's already in Redux records
        const existingLocation = records.find((loc) => loc._id === value);

        if (existingLocation) {
          setCurrentLabel(getStructuredAddress(existingLocation).en);
        } else {
          // If not in Redux, dispatch to fetch it
          try {
            await dispatch(
              actGetLocations({
                page: 1,
                limit: 999999,
                filters: { search: value },
              })
            );

            // Check again in updated records
            const updatedRecords = useAppSelector(
              (state) => state.locations.records
            );
            const foundLocation = updatedRecords.find(
              (loc) => loc._id === value
            );

            if (foundLocation) {
              setCurrentLabel(getStructuredAddress(foundLocation).en);
            } else {
              setCurrentLabel(value); // Fallback to value if not found
            }
          } catch (error) {
            console.error("Error fetching location for display:", error);
            setCurrentLabel(value); // Fallback to value on error
          }
        }
      } catch (error) {
        console.error("Error fetching location for display:", error);
        setCurrentLabel(value); // Fallback to value on error
      }
    };

    fetchLocationLabel();
  }, [value, records, useAddressString, dispatch]);

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
              label: currentLabel || value,
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
