import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import {
  CheckCircle,
  ArrowLeft,
  Printer,
  Mail,
  ExternalLink,
  Edit,
  Calendar,
} from "lucide-react";

export default function OrderSummary() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { getOrderById, loading, error, currentOrder } = useOrders();
  const [orderId, setOrderId] = useState<string | null>(null);

  // State for actual activities form
  const [actualActivityForm, setActualActivityForm] = useState({
    serviceType: "Transportation",
    fromLocation: "Ramallah - Mayyoun",
    toLocation: "Ramallah - Rawabi",
    vehicleType: "Tella 1.5m",
    departureDate: "15/5/2025",
  });

  // Extract order ID from URL and fetch data
  useEffect(() => {
    const pathParts = location.split("/");
    const id = pathParts[pathParts.length - 1];

    if (id && id !== "order-summary") {
      setOrderId(id);
      // Fetch order data immediately
      getOrderById(id).catch((error) => {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch order details",
          variant: "destructive",
        });
      });
    }
  }, [location, getOrderById, toast]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle form changes
  const handleFormChange = (field: string, value: string) => {
    setActualActivityForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save activity
  const handleSaveActivity = () => {
    // TODO: Implement save activity logic
    toast({
      title: "Activity Saved",
      description: "Activity has been saved successfully",
    });
  };

  // Handle print functions
  const handlePrintPlan = () => {
    // TODO: Implement print plan functionality
    toast({
      title: "Print Plan",
      description: "Preparing plan for printing...",
    });
  };

  const handlePrintActivity = () => {
    // TODO: Implement print activity functionality
    toast({
      title: "Print Activity",
      description: "Preparing activity list for printing...",
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order summary...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 text-lg font-semibold">
              Error loading order
            </p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button onClick={() => navigate("/orders")} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show no order state
  if (!currentOrder?.orderDetails) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 text-lg">No order found</p>
            <Button onClick={() => navigate("/orders")} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const order = currentOrder.orderDetails;

  return (
    <div className="w-full p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/orders")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {order.orderIndex || "FRA554464866"}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handlePrintPlan}>
                <Printer className="h-4 w-4 mr-2" />
                Print data
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send data by email
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Exit data
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Update status
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-green-100 text-green-800 mb-2">
                Activities confirmed
              </Badge>
              <p className="text-sm text-gray-600">
                Created by{" "}
                <span className="font-medium">
                  Majoour {formatDate(order.createdAt)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {formatDate(order.createdAt)} {formatTime(order.createdAt)} by
                majoour
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Section */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Order Reference
              </p>
              <p className="text-lg font-semibold text-gray-900">RQu-03</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Customer</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.billingAccount?.custName || "NDamila"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expected Activities Section */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expected activities</CardTitle>
          <Button size="sm" onClick={handlePrintPlan}>
            <Printer className="h-4 w-4 mr-2" />
            Print plan
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Activity date</TableHead>
                <TableHead>Done</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Done by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Transportation</TableCell>
                <TableCell>Tella 1m</TableCell>
                <TableCell>PA.RAARI-Mayyoun</TableCell>
                <TableCell>15/5/2025 12:00 am</TableCell>
                <TableCell>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">Majoour</p>
                    <p className="text-xs text-gray-500">15/5/2025 12:00 AM</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">Ahmed</p>
                    <p className="text-xs text-gray-500">15/5/2025 12:00 AM</p>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Transportation</TableCell>
                <TableCell>Tella 1m</TableCell>
                <TableCell>PA.RAARI-Mayyoun</TableCell>
                <TableCell>15/5/2025 12:00 am</TableCell>
                <TableCell>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">Majoour</p>
                    <p className="text-xs text-gray-500">15/5/2025 12:00 AM</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">Ahmed</p>
                    <p className="text-xs text-gray-500">15/5/2025 12:00 AM</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actual Activities Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Actual activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Service type
              </label>
              <Select
                value={actualActivityForm.serviceType}
                onValueChange={(value) =>
                  handleFormChange("serviceType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                From Location
              </label>
              <Select
                value={actualActivityForm.fromLocation}
                onValueChange={(value) =>
                  handleFormChange("fromLocation", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ramallah - Mayyoun">
                    Ramallah - Mayyoun
                  </SelectItem>
                  <SelectItem value="Ramallah - Rawabi">
                    Ramallah - Rawabi
                  </SelectItem>
                  <SelectItem value="Jerusalem - Center">
                    Jerusalem - Center
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                To Location
              </label>
              <Select
                value={actualActivityForm.toLocation}
                onValueChange={(value) => handleFormChange("toLocation", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ramallah - Rawabi">
                    Ramallah - Rawabi
                  </SelectItem>
                  <SelectItem value="Ramallah - Mayyoun">
                    Ramallah - Mayyoun
                  </SelectItem>
                  <SelectItem value="Jerusalem - Center">
                    Jerusalem - Center
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Vehicle type
              </label>
              <Select
                value={actualActivityForm.vehicleType}
                onValueChange={(value) =>
                  handleFormChange("vehicleType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tella 1.5m">Tella 1.5m</SelectItem>
                  <SelectItem value="Tella 1m">Tella 1m</SelectItem>
                  <SelectItem value="Tella 2m">Tella 2m</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Activity departure date
              </label>
              <Input
                type="text"
                value={actualActivityForm.departureDate}
                onChange={(e) =>
                  handleFormChange("departureDate", e.target.value)
                }
                placeholder="15/5/2025"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveActivity}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities List Section */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activities list</CardTitle>
          <Button size="sm" onClick={handlePrintActivity}>
            <Printer className="h-4 w-4 mr-2" />
            Print Activity
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Planned</TableHead>
                <TableHead>Vendor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      TRANSPORTATION-PA.RAARI-MAYYOUN
                    </p>
                    <p className="text-sm text-gray-500">Tella 1m</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">Majoour</p>
                    <p className="text-xs text-gray-500">15/5/2025 12:00 am</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">WSL</p>
                    <p className="text-xs text-gray-500">VPL-558</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
