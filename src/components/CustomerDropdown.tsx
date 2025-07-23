import React, { useState, useEffect, useCallback } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import {
  SearchableDropdown,
  SearchableDropdownOption,
} from "@/components/ui/searchable-dropdown";
import { Customer } from "@/types/types";
import { useDebounce } from "@/hooks/useDebounce";

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
  const { customers, loading, pagination, getCustomers, clearError } =
    useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Convert customers to dropdown options
  const customerOptions: SearchableDropdownOption[] = allCustomers.map(
    (customer) => ({
      value: customer._id, // Use _id instead of custAccount for MongoDB ObjectId format
      label: customer.custName,
      description: `Account: ${customer.custAccount} | Chain: ${customer.companyChainId}`,
    })
  );

  // Load initial customers
  useEffect(() => {
    getCustomers({ page: 1, limit: 30 });
  }, []);

  // Update customers when API response changes
  useEffect(() => {
    if (customers && customers.length > 0) {
      if (currentPage === 1) {
        setAllCustomers(customers);
      } else {
        setAllCustomers((prev) => {
          // Merge new customers, avoiding duplicates
          const existingIds = new Set(prev.map((c) => c._id));
          const newCustomers = customers.filter((c) => !existingIds.has(c._id));
          return [...prev, ...newCustomers];
        });
      }
    }
  }, [customers, currentPage]);

  // Handle search
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
      setAllCustomers([]);
      getCustomers({
        page: 1,
        limit: 30,
        search: debouncedSearchTerm,
      });
    }
  }, [debouncedSearchTerm, getCustomers]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (pagination && currentPage < pagination.totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getCustomers({
        page: nextPage,
        limit: 30,
        search: debouncedSearchTerm,
      });
    }
  }, [currentPage, pagination, getCustomers, debouncedSearchTerm]);

  // Handle search change
  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  // Check if there are more pages to load
  const hasMore = pagination ? currentPage < pagination.totalPages : false;

  return (
    <SearchableDropdown
      options={customerOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search customers..."
      emptyMessage="No customers found."
      loading={loading && currentPage === 1}
      disabled={disabled}
      className={className}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoadingMore={loading && currentPage > 1}
    />
  );
}
