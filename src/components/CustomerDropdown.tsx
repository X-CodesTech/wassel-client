import React, { useState, useEffect, useCallback, useRef } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import {
  SearchableDropdown,
  SearchableDropdownOption,
} from "@/components/ui/searchable-dropdown";
import { Customer } from "@/types/types";

interface CustomerDropdownProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomerDropdown({
  value,
  onValueChange,
  placeholder = "Select customer...",
  disabled = false,
  className,
}: CustomerDropdownProps) {
  const { customers, loading, error, pagination, getCustomers, clearError } =
    useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasInitialized = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const getCustomersRef = useRef(getCustomers);

  // Update the ref when getCustomers changes
  useEffect(() => {
    getCustomersRef.current = getCustomers;
  }, [getCustomers]);

  // Convert customers to dropdown options
  const customerOptions: SearchableDropdownOption[] = allCustomers.map(
    (customer) => ({
      value: customer._id,
      label: customer.custName,
      description: `Account: ${customer.custAccount} | Chain: ${customer.companyChainId}`,
    })
  );

  // Load initial customers on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      getCustomersRef.current({ page: 1, limit: 30, search: "" });
    }
  }, []);

  // Update customers when API response changes
  useEffect(() => {
    if (customers && customers.length > 0) {
      if (currentPage === 1) {
        // First page or search reset - replace all customers
        setAllCustomers(customers);
      } else {
        // Subsequent pages - append new customers
        setAllCustomers((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const newCustomers = customers.filter((c) => !existingIds.has(c._id));
          return [...prev, ...newCustomers];
        });
      }
    } else if (customers && customers.length === 0 && currentPage === 1) {
      // Clear customers when search returns no results
      setAllCustomers([]);
    }

    // Reset loading more state
    if (currentPage > 1) {
      setIsLoadingMore(false);
    }
  }, [customers, currentPage, searchTerm]);

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
    if (searchTerm === "" && allCustomers.length > 0 && currentPage === 1) {
      return;
    }

    // Set up debounced search
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      setAllCustomers([]);
      getCustomersRef.current({
        page: 1,
        limit: 30,
        search: searchTerm,
      });
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
    getCustomersRef.current({
      page: nextPage,
      limit: 30,
      search: searchTerm,
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
      options={customerOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search by customer name or account..."
      emptyMessage="No customers found."
      loading={loading === "pending" && currentPage === 1}
      disabled={disabled}
      className={className}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
    />
  );
}
