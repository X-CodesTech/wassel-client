import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { UseFormReturn } from "react-hook-form";
import { Loader2, Search, X } from "lucide-react";
import { useLocationSearch } from "@/hooks/useLocationSearch";

type LocationObject = {
  _id: string;
  label: string;
  [key: string]: any; // Allow other properties
};

export type TLocationFieldOptionObject = {
  _id: string;
  label: string;
  [key: string]: any;
};

type TLocationSelect = {
  form: UseFormReturn<any>;
  disabled?: boolean;
  name: string;
  label: string;
  defaultValues?: LocationObject;
};

// Completely uncontrolled search input to prevent focus loss
const SearchInput = React.memo(
  ({
    searchQuery,
    handleSearchChange,
    clearSearch,
    searchInputRef,
    onFocus,
    onBlur,
  }: {
    searchQuery: string;
    handleSearchChange: (value: string) => void;
    clearSearch: () => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
    onFocus: () => void;
    onBlur: () => void;
  }) => {
    const [internalValue, setInternalValue] = useState(searchQuery);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up timeout on unmount
    useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    // Only update internal value when searchQuery changes externally (like from clear button)
    useEffect(() => {
      if (searchQuery !== internalValue) {
        setInternalValue(searchQuery);
        if (searchInputRef.current) {
          searchInputRef.current.value = searchQuery;
        }
      }
    }, [searchQuery, internalValue, searchInputRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInternalValue(value);

      // Debounce the external callback
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        handleSearchChange(value);
      }, 100); // Very short debounce just to batch rapid typing
    };

    const handleClearClick = () => {
      setInternalValue("");
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
        searchInputRef.current.focus(); // Keep focus after clearing
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      clearSearch();
    };

    return (
      <div className="sticky top-0 z-10 bg-background border-b p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search locations..."
            defaultValue={searchQuery}
            onChange={handleInputChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 pr-8"
            onFocus={(e) => {
              onFocus();
              e.stopPropagation();
            }}
            onBlur={(e) => {
              onBlur();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
          {internalValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleClearClick();
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// Memoized location options component
const LocationOptions = React.memo(
  ({
    records,
    loading,
    hasMore,
    loadMore,
    isInitialized,
    userHasInteracted,
  }: {
    records: any[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    isInitialized: boolean;
    userHasInteracted: boolean;
  }) => {
    // Memoize the load more handler to prevent unnecessary re-renders
    const handleLoadMore = useCallback(() => {
      loadMore();
    }, [loadMore]);

    const handleManualLoad = useCallback(() => {
      loadMore();
    }, [loadMore]);

    return (
      <>
        {/* Always show the container */}
        <div className="max-h-48 overflow-y-auto">
          {records.length > 0
            ? records.map((location) => {
                return (
                  <SelectItem key={location._id} value={location._id}>
                    {getStructuredAddress(location).en}
                  </SelectItem>
                );
              })
            : // Show placeholder when no records
              !loading &&
              isInitialized && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No locations found
                </div>
              )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full"
              type="button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}

        {/* Show manual load button if not initialized */}
        {!isInitialized && !loading && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualLoad}
              className="w-full"
              type="button"
            >
              Load locations
            </Button>
          </div>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to reduce re-renders
    return (
      prevProps.records.length === nextProps.records.length &&
      prevProps.loading === nextProps.loading &&
      prevProps.hasMore === nextProps.hasMore &&
      prevProps.isInitialized === nextProps.isInitialized &&
      prevProps.userHasInteracted === nextProps.userHasInteracted &&
      JSON.stringify(prevProps.records.map((r) => r._id)) ===
        JSON.stringify(nextProps.records.map((r) => r._id))
    );
  }
);

LocationOptions.displayName = "LocationOptions";

const LocationSelect = React.memo<TLocationSelect>(
  ({ form, disabled, name, label, defaultValues }) => {
    const {
      records,
      loading,
      searchQuery,
      handleSearchChange,
      loadMore,
      clearSearch,
      hasMore,
      isEmpty,
      isInitialized,
      userHasInteracted,
      initializeData,
      loadSpecificLocations,
    } = useLocationSearch();

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize data when dropdown opens for the first time OR when we have defaultValues
    useEffect(() => {
      if (
        (isOpen && !isInitialized && !loading) ||
        (defaultValues?._id && !isInitialized && !loading)
      ) {
        initializeData();
      }
    }, [isOpen, isInitialized, loading, initializeData, defaultValues?._id]);

    // Load specific location if we have defaultValues but the location isn't in records
    useEffect(() => {
      if (defaultValues?._id && isInitialized && !loading) {
        const locationExists = records.some(
          (location) => location._id === defaultValues._id
        );
        if (!locationExists) {
          loadSpecificLocations([defaultValues._id]);
        }
      }
    }, [
      defaultValues?._id,
      isInitialized,
      loading,
      records,
      loadSpecificLocations,
    ]);

    // Aggressive focus preservation using direct DOM manipulation
    const preserveFocus = useCallback(() => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      focusTimeoutRef.current = setTimeout(() => {
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          const input = searchInputRef.current;
          const value = input.value;
          const cursorPos = input.selectionStart || 0;

          input.focus();
          input.setSelectionRange(cursorPos, cursorPos);
        }
      }, 10);
    }, []);

    // Clean up timeout on unmount
    useEffect(() => {
      return () => {
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
        }
      };
    }, []);

    // Stable handlers to prevent unnecessary re-renders
    const stableHandleSearchChange = useCallback(
      (value: string) => {
        handleSearchChange(value);
        preserveFocus();
      },
      [handleSearchChange, preserveFocus, searchQuery]
    );

    const stableHandleClearSearch = useCallback(() => {
      clearSearch();
    }, [clearSearch]);

    const stableHandleFocus = useCallback(() => {
      // Focus handler
    }, []);

    const stableHandleBlur = useCallback(() => {
      // Blur handler
    }, []);

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          // Memoize display values inside render where field.value is available
          const displayValues = useMemo(() => {
            const currentValue = field.value || defaultValues?._id || "";

            // First try to find the location in the loaded records
            const selectedLocation = records.find(
              (location) => location._id === currentValue
            );

            // If found in records, use its structured address
            if (selectedLocation) {
              return {
                currentValue,
                displayText: getStructuredAddress(selectedLocation).en,
              };
            }

            // If not found in records but we have defaultValues with a label, use that
            if (defaultValues?.label && currentValue === defaultValues._id) {
              return {
                currentValue,
                displayText: defaultValues.label,
              };
            }

            // If we have a currentValue but no matching location, show a placeholder
            if (currentValue && !selectedLocation && !defaultValues?.label) {
              return {
                currentValue,
                displayText: `Location ${currentValue}`,
              };
            }

            // Default case
            return {
              currentValue,
              displayText: defaultValues?.label || "",
            };
          }, [field.value, defaultValues?._id, defaultValues?.label, records]);

          return (
            <FormItem className="flex flex-col h-full">
              <FormLabel>{label}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={displayValues.currentValue}
                disabled={disabled}
                onOpenChange={(open) => {
                  setIsOpen(open);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location">
                      {displayValues.displayText || "Select location"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="p-0">
                  {/* Search Input - Sticky to top */}
                  <SearchInput
                    searchQuery={searchQuery}
                    handleSearchChange={stableHandleSearchChange}
                    clearSearch={stableHandleClearSearch}
                    searchInputRef={searchInputRef}
                    onFocus={stableHandleFocus}
                    onBlur={stableHandleBlur}
                  />

                  {/* Loading State */}
                  {loading && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Loading...
                      </span>
                    </div>
                  )}

                  {/* Empty State - Show when initialized but no records */}
                  {isInitialized && !loading && records.length === 0 && (
                    <div className="flex items-center justify-center p-4">
                      <span className="text-sm text-muted-foreground">
                        No options
                      </span>
                    </div>
                  )}

                  {/* Location Options - Always show the component */}
                  <LocationOptions
                    records={records}
                    loading={loading}
                    hasMore={hasMore}
                    loadMore={loadMore}
                    isInitialized={isInitialized}
                    userHasInteracted={userHasInteracted}
                  />
                </SelectContent>
              </Select>
            </FormItem>
          );
        }}
      />
    );
  }
);

LocationSelect.displayName = "LocationSelect";

export default LocationSelect;
