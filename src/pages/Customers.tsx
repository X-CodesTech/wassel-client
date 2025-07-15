import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, DollarSign, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerFilters } from "@/types/types";
import Pagination from "@/components/Pagination";

export default function Customers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    customers,
    loading,
    error,
    importLoading,
    importError,
    importStats,
    pagination,
    getCustomers,
    importCustomers,
    clearError,
    clearImportError,
  } = useCustomers();

  // Local state for filters
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 12,
    search: "",
    sortBy: "createdDate",
    sortOrder: "desc",
  });

  // Load customers on component mount
  useEffect(() => {
    getCustomers(filters);
  }, [filters]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as CustomerFilters["sortBy"],
      page: 1,
    }));
  };

  // Handle sort order change
  const handleSortOrderChange = (sortOrder: string) => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: sortOrder as CustomerFilters["sortOrder"],
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle refresh with import
  const handleRefresh = async () => {
    try {
      // First import customers from third party provider
      await importCustomers();

      // Then refresh the customers list
      getCustomers(filters);

      toast({
        title: "Success",
        description: "Customer data imported and refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import customers. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Customer Management
        </h2>
        <p className="text-gray-500 mt-2">
          Manage your customer database and custom pricing configurations
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name or account..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdDate">Created Date</SelectItem>
              <SelectItem value="custName">Customer Name</SelectItem>
              <SelectItem value="custAccount">Account</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortOrder}
            onValueChange={handleSortOrderChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">
          Your Customers
          {pagination.total > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              ({pagination.total} total)
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">Data refreshed every 6 hours</p>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={loading === "pending" || importLoading === "pending"}
          >
            {loading === "pending" || importLoading === "pending" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7548 5.77409 19.1446 8.33116"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.24516 18.2259 4.85541 15.6688"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16.9999 8L19.9999 8L19.9999 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 16L4 16L4 19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span>
              {importLoading === "pending" ? "Importing..." : "Refresh"}
            </span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Import Error Display */}
      {importError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>Import Error: {importError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearImportError}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Import Statistics */}
      {importStats && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h4 className="font-medium mb-2">
                Import Completed Successfully
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total:</span>{" "}
                  {importStats.total}
                </div>
                <div>
                  <span className="font-medium">Inserted:</span>{" "}
                  {importStats.inserted}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {importStats.updated}
                </div>
                <div>
                  <span className="font-medium">Unchanged:</span>{" "}
                  {importStats.unchanged}
                </div>
                <div>
                  <span className="font-medium">Failed:</span>{" "}
                  {importStats.failed}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-green-700 hover:text-green-900"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading === "pending" && (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-medium mb-2">Loading Customers...</h3>
            <p className="text-gray-500">
              Please wait while we fetch your customer data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {loading === "fulfilled" && customers?.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Customers Found</h3>
            <p className="text-gray-500 max-w-md mb-4">
              {filters.search
                ? `No customers found matching "${filters.search}". Try adjusting your search criteria.`
                : "You haven't added any customers yet. Start by adding your first customer to manage their information and custom pricing."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Customers Grid */}
      {loading === "fulfilled" && customers?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card
              key={customer.custAccount}
              className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-[320px]"
              // onClick={() => setLocation(`/customers/${customer.custAccount}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  {customer.custName}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-1 text-sm mb-1">
                    <span className="font-medium">Account:</span>
                    <span>{customer.custAccount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">Chain ID:</span>
                    {customer?.companyChainId ? (
                      <span>{customer.companyChainId}</span>
                    ) : (
                      "N/A"
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        customer.blocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customer.blocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div className="text-sm font-medium text-gray-500">
                      Customer Information
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="text-sm text-gray-600">
                      <p>
                        This customer is part of the {customer.companyChainId}{" "}
                        chain.
                      </p>
                      <p className="mt-1">
                        Account status:{" "}
                        {customer.blocked
                          ? "Currently blocked"
                          : "Active and operational"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2 pb-4 mt-auto border-t">
                <div className="text-xs text-gray-500">
                  Created: {new Date(customer.createdDate).toLocaleDateString()}
                </div>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    // setLocation(`/customers/${customer.custAccount}`);
                  }}
                >
                  View Details
                </Button> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {loading === "fulfilled" &&
        customers.length > 0 &&
        pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageLimit={pagination.limit}
            totalResults={pagination.total}
            onPageChange={handlePageChange}
            onLimitChange={(limit) =>
              setFilters((prev) => ({ ...prev, limit, page: 1 }))
            }
          />
        )}
    </div>
  );
}
