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
  const { customers, loading, error, pagination, getCustomers, clearError } =
    useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Remove: const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    // Reset loading more state when customers are updated
    if (currentPage > 1) {
      setIsLoadingMore(false);
    }
  }, [customers, currentPage]);

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
    setAllCustomers([]);
    getCustomers({
      page: 1,
      limit: 30,
      search: searchTerm,
    });
  }, [searchTerm, getCustomers]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    // Prevent multiple simultaneous requests
    if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    setCurrentPage(nextPage);
    getCustomers({
      page: nextPage,
      limit: 30,
      search: searchTerm,
    });
  }, [currentPage, pagination, getCustomers, searchTerm, isLoadingMore]);

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
