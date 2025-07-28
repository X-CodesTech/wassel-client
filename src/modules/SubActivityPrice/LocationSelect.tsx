import React, { useMemo, useRef, useEffect, useState } from "react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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

type TLocationSelect = {
  form: UseFormReturn<any>;
  disabled?: boolean;
  name: string;
  label: string;
  defaultValues?: LocationObject;
};

// Memoized search input component
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
    return (
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 pr-8"
            autoFocus={false}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-8 p-0"
              onClick={clearSearch}
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
    console.log("📋 LocationOptions render:", {
      recordsCount: records.length,
      loading,
      hasMore,
      isInitialized,
      userHasInteracted,
    });

    return (
      <>
        {/* Always show the container */}
        <div className="max-h-48 overflow-y-auto">
          {records.length > 0
            ? records.map((location) => {
                console.log(
                  "🏷️ Rendering location:",
                  location._id,
                  getStructuredAddress(location).en
                );
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
              onClick={() => {
                console.log("⬇️ Load more clicked");
                loadMore();
              }}
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
              onClick={() => {
                console.log("🎬 Manual load clicked");
                loadMore();
              }}
              className="w-full"
              type="button"
            >
              Load locations
            </Button>
          </div>
        )}
      </>
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
    } = useLocationSearch();

    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [wasSearchFocused, setWasSearchFocused] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);

    // Debug logging
    useEffect(() => {
      console.log("🔄 LocationSelect state:", {
        records: records.length,
        loading,
        isInitialized,
        isEmpty,
        hasMore,
        isOpen,
        wasSearchFocused,
        isUserTyping,
      });
    }, [
      records.length,
      loading,
      isInitialized,
      isEmpty,
      hasMore,
      isOpen,
      wasSearchFocused,
      isUserTyping,
    ]);

    // Initialize data when dropdown opens for the first time
    useEffect(() => {
      console.log("👀 Dropdown open effect:", {
        isOpen,
        isInitialized,
        loading,
      });
      if (isOpen && !isInitialized && !loading) {
        console.log("🎯 Calling initializeData");
        initializeData();
      }
    }, [isOpen, isInitialized, loading, initializeData]);

    // Enhanced focus management - restore focus after loading completes
    useEffect(() => {
      if (!loading && wasSearchFocused && searchInputRef.current) {
        console.log("🎯 Restoring focus after loading completed");
        const timeoutId = setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            // Move cursor to end
            const length = searchInputRef.current.value.length;
            searchInputRef.current.setSelectionRange(length, length);
          }
        }, 50); // Small delay to ensure DOM is updated

        return () => clearTimeout(timeoutId);
      }
    }, [loading, wasSearchFocused]);

    // Track when user stops typing (debounced)
    useEffect(() => {
      const timer = setTimeout(() => {
        console.log("⏰ Typing timeout - user stopped typing");
        setIsUserTyping(false);
      }, 1000); // Consider user stopped typing after 1 second

      return () => clearTimeout(timer);
    }, [searchQuery]);

    // Clear focus tracking only when dropdown closes or after significant delay
    useEffect(() => {
      if (searchQuery === "" && !isUserTyping) {
        const timer = setTimeout(() => {
          console.log("🧹 Clearing focus tracking after empty search delay");
          setWasSearchFocused(false);
        }, 2000); // Wait 2 seconds after search is cleared before clearing focus tracking

        return () => clearTimeout(timer);
      }
    }, [searchQuery, isUserTyping]);

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          // Memoize display values to prevent unnecessary recalculations
          const { currentValue, displayText } = useMemo(() => {
            const currentValue = field.value || defaultValues?._id || "";
            const selectedLocation = records.find(
              (location) => location._id === currentValue
            );
            const displayText = selectedLocation
              ? getStructuredAddress(selectedLocation).en
              : defaultValues?.label || "";

            return { currentValue, displayText };
          }, [field.value, defaultValues?._id, defaultValues?.label, records]);

          return (
            <FormItem className="flex flex-col h-full">
              <FormLabel>{label}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={currentValue}
                disabled={disabled}
                onOpenChange={(open) => {
                  console.log("🎪 Dropdown onOpenChange:", open);
                  setIsOpen(open);
                  if (!open) {
                    // Clear focus tracking when dropdown closes
                    setWasSearchFocused(false);
                    setIsUserTyping(false);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location">
                      {displayText || "Select location"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="p-0">
                  {/* Search Input */}
                  <SearchInput
                    searchQuery={searchQuery}
                    handleSearchChange={(value) => {
                      console.log("🔍 Search input changed:", {
                        from: searchQuery,
                        to: value,
                      });
                      setWasSearchFocused(true);
                      setIsUserTyping(true);
                      handleSearchChange(value);
                    }}
                    clearSearch={() => {
                      console.log("🧹 Search cleared via button");
                      setWasSearchFocused(false);
                      setIsUserTyping(false);
                      clearSearch();
                    }}
                    searchInputRef={searchInputRef}
                    onFocus={() => {
                      console.log("🎯 Search input focused");
                      setWasSearchFocused(true);
                    }}
                    onBlur={() => {
                      console.log("😴 Search input blurred");
                      // Don't immediately clear focus tracking on blur
                      // because it might be due to re-render during loading
                      setTimeout(() => {
                        if (!isUserTyping && searchQuery === "") {
                          console.log("🧹 Delayed focus clear after blur");
                          setWasSearchFocused(false);
                        }
                      }, 500);
                    }}
                  />

                  {/* Debug Info */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="p-2 text-xs text-gray-500 border-b">
                      Debug: {records.length} records, loading:{" "}
                      {loading.toString()}, init: {isInitialized.toString()}
                      <br />
                      Focus: focused={wasSearchFocused.toString()}, typing=
                      {isUserTyping.toString()}
                    </div>
                  )}

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
