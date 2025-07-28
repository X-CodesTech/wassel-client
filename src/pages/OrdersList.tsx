import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import {
  Search,
  Plus,
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  Calendar,
  Package,
  User,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrdersList() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const {
    getOrders,
    ordersList,
    ordersListLoading,
    ordersListError,
    totalOrders,
    currentPage,
  } = useOrders();

  // Debug log
  console.log(
    "OrdersList component - ordersList:",
    ordersList,
    "type:",
    typeof ordersList,
    "isArray:",
    Array.isArray(ordersList)
  );

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const params = {
          page,
          limit,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        };
        const response = await getOrders(params);
        console.log("Orders API Response:", response);
        console.log("OrdersList from hook:", ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
      }
    };

    fetchOrdersData();
  }, [page, limit, searchTerm, statusFilter, getOrders, toast]);

  // Handle search with debounce
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  }, []);

  // Handle status filter change
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle row click to navigate to order details
  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Helper function to format location
  const formatLocation = (location: any) => {
    if (!location) return "N/A";
    return `${location.country || "N/A"}, ${location.area || "N/A"}`;
  };

  // Helper function to get status badge
  const getStatusBadge = (order: any) => {
    if (order.isDraft) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Draft
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Active
      </Badge>
    );
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / limit);

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-gray-600">Manage and track all orders</p>
        </div>
        <Button
          onClick={() => navigate("/create-order")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by ID, customer, or service..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Additional Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {ordersListLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            </div>
          ) : ordersListError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 text-lg font-semibold">
                  Error loading orders
                </p>
                <p className="text-gray-600 mt-2">{ordersListError}</p>
                <Button
                  onClick={() => getOrders({ page, limit })}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : !Array.isArray(ordersList) || ordersList.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No orders found</p>
                <p className="text-gray-500 mt-2">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first order to get started"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => navigate("/create-order")}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Pickup Location</TableHead>
                    <TableHead>Delivery Location</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(ordersList) &&
                    ordersList.map((order) => (
                      <TableRow
                        key={order._id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleOrderClick(order._id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-blue-600 font-semibold">
                              {order.orderIndex || order._id.slice(-6)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {order.billingAccount?.custName || "N/A"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {order.contactPerson}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.service}</span>
                            <span className="text-sm text-gray-500">
                              {order.typesOfGoods}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {order.pickupInfo?.[0]
                                ? formatLocation(
                                    order.pickupInfo[0].pickupLocation
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {order.deliveryInfo?.[0]
                                ? formatLocation(
                                    order.deliveryInfo[0].deliveryLocation
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order)}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            $
                            {(
                              (order.truckTypeMatches || []).reduce(
                                (sum: number, item: any) =>
                                  sum + (item.price || 0),
                                0
                              ) +
                              (
                                order.specialRequirementsPrices
                                  ?.pickupSpecialRequirements || []
                              ).reduce(
                                (sum: number, item: any) =>
                                  sum +
                                  (item.basePrice || 0) +
                                  (item.locationPrice || 0),
                                0
                              ) +
                              (
                                order.specialRequirementsPrices
                                  ?.deliverySpecialRequirements || []
                              ).reduce(
                                (sum: number, item: any) =>
                                  sum +
                                  (item.basePrice || 0) +
                                  (item.locationPrice || 0),
                                0
                              )
                            ).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOrderClick(order._id);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement edit functionality
                                }}
                              >
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement duplicate functionality
                                }}
                              >
                                Duplicate Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!ordersListLoading &&
        Array.isArray(ordersList) &&
        ordersList.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, totalOrders)} of {totalOrders} orders
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <Button
                          variant={page === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
