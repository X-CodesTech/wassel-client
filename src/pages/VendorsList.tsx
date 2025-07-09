import { useState, useEffect } from "react";
import { VendorFilters } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useVendors } from "@/hooks/useVendors";
import {
  RefreshCw,
  Search,
  Building2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";

export default function VendorsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const {
    records: vendors,
    activeVendorsCount,
    blockedVendorsCount,
    loading,
    error,
    pagination,
    syncLoading,
    syncError,
    syncStats,
    getVendors,
    syncVendors,
    clearError,
    clearSyncError,
    clearSyncStats,
  } = useVendors();

  // Fetch vendors on component mount and when filters change
  useEffect(() => {
    const filters: VendorFilters = {
      page: currentPage,
      limit: pageLimit,
      search: searchTerm || undefined,
      sortBy: "createdDate",
      sortOrder: "desc",
    };
    getVendors(filters);
  }, [currentPage, searchTerm, pageLimit]); // Removed getVendors from dependencies

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      clearSyncError();
      clearSyncStats();
    };
  }, []); // Removed clearError from dependencies

  // Handle refresh vendors
  const handleRefreshVendors = async () => {
    try {
      syncVendors();
      // After sync, refresh the vendors list
      const filters: VendorFilters = {
        page: currentPage,
        limit: pageLimit,
        search: searchTerm || undefined,
        sortBy: "createdDate",
        sortOrder: "desc",
      };
      getVendors(filters);
    } catch (error) {
      console.error("Error refreshing vendors:", error);
    }
  };

  // Show sync success message
  useEffect(() => {
    if (syncStats) {
      toast({
        title: "Vendors Synced Successfully",
        description: `Total: ${syncStats.total}, Inserted: ${syncStats.inserted}, Updated: ${syncStats.updated}, Unchanged: ${syncStats.unchanged}, Failed: ${syncStats.failed}`,
      });
      clearSyncStats();
    }
  }, [syncStats, toast, clearSyncStats]);

  // Show sync error message
  useEffect(() => {
    if (syncError) {
      toast({
        title: "Sync Error",
        description: syncError,
        variant: "destructive",
      });
      clearSyncError();
    }
  }, [syncError, toast, clearSyncError]);

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page limit change
  const handlePageLimitChange = (value: string) => {
    setPageLimit(Number(value));
    setCurrentPage(1); // Reset to first page when changing limit
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const pages = [];

    // Always show first page
    pages.push(1);

    // Show pages around current page
    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const getStatusBadge = (blocked: boolean) => {
    return blocked ? (
      <Badge variant="secondary">Blocked</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    );
  };

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Vendors
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => getVendors()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <title>Vendors List | Wassel</title>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your vendor partnerships and contracts
          </p>
        </div>

        <Button
          onClick={handleRefreshVendors}
          disabled={syncLoading === "pending"}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              syncLoading === "pending" ? "animate-spin" : ""
            }`}
          />
          {syncLoading === "pending" ? "Syncing..." : "Sync Vendors"}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vendors by name or account..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vendors
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVendorsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blocked Vendors
            </CardTitle>
            <Badge variant="secondary">Blocked</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedVendorsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Account</TableHead>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Group ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading === "pending" ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-blue-100 p-3 mb-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-sm text-gray-500">Loading vendors...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  No vendors found.{" "}
                  {searchTerm && "Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow
                  key={vendor._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/vendors/${vendor.vendAccount}`)}
                >
                  <TableCell>
                    <div className="font-medium">{vendor.vendAccount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{vendor.vendName}</div>
                  </TableCell>
                  <TableCell>{vendor.vendGroupId}</TableCell>
                  <TableCell>{getStatusBadge(vendor.blocked)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(vendor.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm text-gray-500">
                      Click to view details
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                value={pageLimit.toString()}
                onValueChange={handlePageLimitChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {generatePageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-2 text-sm text-gray-500">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
