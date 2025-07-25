import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Order } from "@/types/types";
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
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Package,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Truck,
  Weight,
  Plus,
  Upload,
  Paperclip,
} from "lucide-react";

export default function OrdersList() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { getOrderById, loading, error, currentOrder } = useOrders();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      uploadedAt: string;
    }>
  >([]);
  const [uploading, setUploading] = useState(false);

  // File upload function
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !orderId) return;

    setUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch(`/uploads/orders/${orderId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Files uploaded successfully",
        });
        // Refresh attachments list
        // You might want to fetch the updated attachments list here
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleFileUpload(event.target.files);
    // Reset the input
    event.target.value = "";
  };

  // Extract order ID from URL and fetch data
  useEffect(() => {
    const pathParts = location.split("/");
    const id = pathParts[pathParts.length - 1];

    if (id && id !== "orders") {
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

  // Show loading state
  if (loading) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
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

  // Helper function to format location
  const formatLocation = (location: any) => {
    return `${location.country}, ${location.area}, ${location.city}`;
  };

  // Helper function to format special requirements
  const formatSpecialRequirements = (requirements: any[]) => {
    return requirements.map(
      (req) =>
        `${req.quantity} x ${req.subActivity.portalItemNameEn}${
          req.note ? ` - ${req.note}` : ""
        }`
    );
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header with Order Info and Actions */}
      <title>Order Details | Wassel</title>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold">Order info</h1>
            <h2 className="text-3xl font-bold text-blue-600">{order._id}</h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Created date: {formatDate(order.createdAt)}</span>
              <span>Service: {order.service}</span>
              <span>Contact: {order.contactPerson}</span>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>Types of goods: {order.typesOfGoods}</span>
              <span>Customer: {order.billingAccount.custName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status and Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Active
          </Badge>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="order"
              name="type"
              className="text-blue-600"
              defaultChecked
            />
            <label htmlFor="order" className="text-sm">
              Order
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-600 text-white">
            Ready for processing
          </Badge>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Post order
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Quick post
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Send by email
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Print order
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Required Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Required service details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                <li className="text-sm">Service: {order.service}</li>
                <li className="text-sm">
                  Types of goods: {order.typesOfGoods}
                </li>
                <li className="text-sm">
                  Goods description: {order.goodsDescription}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Details Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Service</TableHead>
                    <TableHead className="w-1/4">Details</TableHead>
                    <TableHead className="w-1/4">Requester Name</TableHead>
                    <TableHead className="w-1/4">
                      {order.requesterName}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Type of goods</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={order.typesOfGoods}
                    >
                      {order.typesOfGoods}
                    </TableCell>
                    <TableCell className="font-medium">
                      Requester mobile number 1
                    </TableCell>
                    <TableCell>{order.requesterMobile1}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Goods description
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div
                        className="line-clamp-2"
                        title={order.goodsDescription}
                      >
                        {order.goodsDescription}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      Requester mobile number 2
                    </TableCell>
                    <TableCell>{order.requesterMobile2 || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Billing Account
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={order.billingAccount.custName}
                    >
                      {order.billingAccount.custName}
                    </TableCell>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={order.emailAddress}
                    >
                      {order.emailAddress}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pickup Points */}
          {order.pickupInfo.map((pickup, index) => (
            <Card key={`pickup-${index}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Pickup point {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">
                        Pickup location:
                      </p>
                      <p className="text-gray-900">
                        {formatLocation(pickup.pickupLocation)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Pickup address:
                      </p>
                      <p className="text-gray-900 break-words">
                        {pickup.pickupDetailedAddress}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Pickup time window:
                      </p>
                      <p className="text-gray-900">
                        {formatDate(pickup.fromTime)}{" "}
                        {formatTime(pickup.fromTime)} -{" "}
                        {formatTime(pickup.toTime)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Pickup notes:</p>
                      <p className="text-gray-900 break-words">
                        {pickup.pickupNotes || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Special requirements:
                      </p>
                      <ul className="ml-4 space-y-1">
                        {formatSpecialRequirements(
                          pickup.pickupSpecialRequirements
                        ).map((req, reqIndex) => (
                          <li
                            key={reqIndex}
                            className="text-gray-900 break-words"
                          >
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">
                        Pickup coordinator name:
                      </p>
                      <p className="text-gray-900">
                        {pickup.pickupCoordinator.requesterName}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Pickup coordinator mobile 1:
                      </p>
                      <p className="text-gray-900">
                        {pickup.pickupCoordinator.requesterMobile1}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Pickup coordinator mobile 2:
                      </p>
                      <p className="text-gray-900">
                        {pickup.pickupCoordinator.requesterMobile2 || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email:</p>
                      <p className="text-gray-900 break-all">
                        {pickup.pickupCoordinator.emailAddress}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Other requirements:
                      </p>
                      <p className="text-gray-900 break-words">
                        {pickup.otherRequirements || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Delivery Points */}
          {order.deliveryInfo.map((delivery, index) => (
            <Card key={`delivery-${index}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Delivery point {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery location:
                      </p>
                      <p className="text-gray-900">
                        {formatLocation(delivery.deliveryLocation)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery address:
                      </p>
                      <p className="text-gray-900 break-words">
                        {delivery.deliveryDetailedAddress}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery time window:
                      </p>
                      <p className="text-gray-900">
                        {formatDate(delivery.fromTime)}{" "}
                        {formatTime(delivery.fromTime)} -{" "}
                        {formatTime(delivery.toTime)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery notes:
                      </p>
                      <p className="text-gray-900 break-words">
                        {delivery.deliveryNotes || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Special requirements:
                      </p>
                      <ul className="ml-4 space-y-1">
                        {formatSpecialRequirements(
                          delivery.deliverySpecialRequirements
                        ).map((req, reqIndex) => (
                          <li
                            key={reqIndex}
                            className="text-gray-900 break-words"
                          >
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery coordinator name:
                      </p>
                      <p className="text-gray-900">
                        {delivery.deliveryCoordinator.requesterName}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery coordinator mobile 1:
                      </p>
                      <p className="text-gray-900">
                        {delivery.deliveryCoordinator.requesterMobile1}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Delivery coordinator mobile 2:
                      </p>
                      <p className="text-gray-900">
                        {delivery.deliveryCoordinator.requesterMobile2 || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email:</p>
                      <p className="text-gray-900 break-all">
                        {delivery.deliveryCoordinator.emailAddress}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Other requirements:
                      </p>
                      <p className="text-gray-900 break-words">
                        {delivery.otherRequirements || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Shipping units:</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.shippingUnits.activityNameEn}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Type of truck:</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.typeOfTruck.portalItemNameEn}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Quantity:</p>
                    <p className="text-gray-900">{order.shippingDetails.qty}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Dimensions (M):</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.dimM}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Length:</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.length} cm
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Width:</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.width} cm
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Height:</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.height} cm
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Total weight:</p>
                    <p className="text-gray-900">
                      {order.shippingDetails.totalWeight} kg
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Notes:</p>
                    <p className="text-gray-900 break-words">
                      {order.shippingDetails.note || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Price Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-blue-600">
                    Transportation
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Packaging
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Warehouse
                  </Button>
                  <Button size="sm" className="bg-green-600">
                    Send by email
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Print offer
                  </Button>
                </div>

                {/* Truck Type Matches */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                      <span className="col-span-3">Service</span>
                      <span className="col-span-2">Pricing Method</span>
                      <span className="col-span-1">Price</span>
                      <span className="col-span-1">Cost</span>
                      <span className="col-span-4">Route</span>
                      <span className="col-span-1">Action</span>
                    </div>
                  </div>
                  {order.truckTypeMatches.map((item, index) => (
                    <div key={index} className="p-4 border-b last:border-b-0">
                      <div className="grid grid-cols-12 gap-4 text-sm">
                        <span
                          className="col-span-3 truncate"
                          title={item.subActivityName}
                        >
                          {item.subActivityName}
                        </span>
                        <span
                          className="col-span-2 truncate"
                          title={item.pricingMethod}
                        >
                          {item.pricingMethod}
                        </span>
                        <span className="col-span-1">${item.price}</span>
                        <span className="col-span-1">${item.cost}</span>
                        <span
                          className="col-span-4 truncate"
                          title={`${item.locationDetails.fromLocation} → ${item.locationDetails.toLocation}`}
                        >
                          {item.locationDetails.fromLocation} →{" "}
                          {item.locationDetails.toLocation}
                        </span>
                        <span className="col-span-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Requirements Prices */}
                {order.specialRequirementsPrices.pickupSpecialRequirements
                  .length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-blue-50 p-4 border-b">
                      <h4 className="font-medium">
                        Pickup Special Requirements
                      </h4>
                    </div>
                    {order.specialRequirementsPrices.pickupSpecialRequirements.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="p-4 border-b last:border-b-0"
                        >
                          <div className="grid grid-cols-12 gap-4 text-sm">
                            <span
                              className="col-span-3 truncate"
                              title={item.subActivityName}
                            >
                              {item.subActivityName}
                            </span>
                            <span
                              className="col-span-2 truncate"
                              title={item.pricingMethod}
                            >
                              {item.pricingMethod}
                            </span>
                            <span className="col-span-1">
                              Qty: {item.quantity}
                            </span>
                            <span className="col-span-2">
                              ${item.basePrice + item.locationPrice}
                            </span>
                            <span className="col-span-2">
                              Cost: ${item.cost}
                            </span>
                            <span className="col-span-2"></span>
                          </div>
                          {item.note && (
                            <p
                              className="text-xs text-gray-600 mt-2 break-words"
                              title={item.note}
                            >
                              Note: {item.note}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {order.specialRequirementsPrices.deliverySpecialRequirements
                  .length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-green-50 p-4 border-b">
                      <h4 className="font-medium">
                        Delivery Special Requirements
                      </h4>
                    </div>
                    {order.specialRequirementsPrices.deliverySpecialRequirements.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="p-4 border-b last:border-b-0"
                        >
                          <div className="grid grid-cols-12 gap-4 text-sm">
                            <span
                              className="col-span-3 truncate"
                              title={item.subActivityName}
                            >
                              {item.subActivityName}
                            </span>
                            <span
                              className="col-span-2 truncate"
                              title={item.pricingMethod}
                            >
                              {item.pricingMethod}
                            </span>
                            <span className="col-span-1">
                              Qty: {item.quantity}
                            </span>
                            <span className="col-span-2">
                              ${item.basePrice + item.locationPrice}
                            </span>
                            <span className="col-span-2">
                              Cost: ${item.cost}
                            </span>
                            <span className="col-span-2"></span>
                          </div>
                          {item.note && (
                            <p
                              className="text-xs text-gray-600 mt-2 break-words"
                              title={item.note}
                            >
                              Note: {item.note}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Total Price:</p>
                    <p className="text-gray-900 text-lg font-semibold">
                      $
                      {order.truckTypeMatches.reduce(
                        (sum, item) => sum + item.price,
                        0
                      ) +
                        order.specialRequirementsPrices.pickupSpecialRequirements.reduce(
                          (sum, item) =>
                            sum + item.basePrice + item.locationPrice,
                          0
                        ) +
                        order.specialRequirementsPrices.deliverySpecialRequirements.reduce(
                          (sum, item) =>
                            sum + item.basePrice + item.locationPrice,
                          0
                        )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Total Cost:</p>
                    <p className="text-gray-900 text-lg font-semibold">
                      $
                      {order.truckTypeMatches.reduce(
                        (sum, item) => sum + item.cost,
                        0
                      ) +
                        order.specialRequirementsPrices.pickupSpecialRequirements.reduce(
                          (sum, item) => sum + item.cost,
                          0
                        ) +
                        order.specialRequirementsPrices.deliverySpecialRequirements.reduce(
                          (sum, item) => sum + item.cost,
                          0
                        )}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Status:</p>
                    <Badge variant={order.isDraft ? "secondary" : "default"}>
                      {order.isDraft ? "Draft" : "Final"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Created:</p>
                    <p className="text-gray-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Updated:</p>
                    <p className="text-gray-900">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Contact Person:</p>
                    <p className="text-gray-900 break-words">
                      {order.contactPerson}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Initial Price Offer */}
          <Card>
            <CardHeader>
              <CardTitle>Initial Price Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Offer ID */}
                <div className="bg-blue-600 text-white p-4 rounded-lg">
                  <h3 className="font-bold text-lg">IPO-{order._id}</h3>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-blue-600">
                    Submit this IPO
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Add service line +
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Download excel
                  </Button>
                  <Button size="sm" className="bg-green-600">
                    Send by email
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Print IPO
                  </Button>
                </div>

                {/* Service Lines Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="grid grid-cols-9 gap-4 text-sm font-medium">
                      <span>PL#</span>
                      <span>Service</span>
                      <span>Qty</span>
                      <span>Description</span>
                      <span>Price</span>
                      <span>Cost Window</span>
                      <span>Vendor</span>
                      <span>Cost</span>
                      <span>Pricing</span>
                    </div>
                  </div>

                  {/* Sample service line - you can map through actual data */}
                  <div className="p-4 border-b">
                    <div className="grid grid-cols-9 gap-4 text-sm">
                      <span
                        className="text-blue-600 cursor-pointer"
                        title="Click to view customer price line"
                      >
                        PL-001
                      </span>
                      <span>Transportation</span>
                      <span>1</span>
                      <span
                        className="truncate"
                        title="Transportation from pickup to delivery location"
                      >
                        Transportation Service
                      </span>
                      <span>${order.truckTypeMatches[0]?.price || 0}</span>
                      <span className="text-xs">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                      </span>
                      <span>Auto</span>
                      <span>${order.truckTypeMatches[0]?.cost || 0}</span>
                      <span>Auto</span>
                    </div>
                  </div>
                </div>

                {/* IPO Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Initial Price Offer Summary</h4>
                    <div>
                      <p className="text-sm text-gray-600">
                        Selling price:{" "}
                        <span className="font-medium text-gray-900">
                          $
                          {order.truckTypeMatches.reduce(
                            (sum, item) => sum + item.price,
                            0
                          )}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Cost:{" "}
                        <span className="font-medium text-gray-900">
                          $
                          {order.truckTypeMatches.reduce(
                            (sum, item) => sum + item.cost,
                            0
                          )}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Profit margin:{" "}
                        <span className="font-medium text-gray-900">40%</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Update price manual
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Update cost
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Unactive
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Paperclip className="mr-2 h-5 w-5" />
                  Attachments
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                    accept="*/*"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Add Files</span>
                        </div>
                      )}
                    </Button>
                  </label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No attachments uploaded yet</p>
                  <p className="text-sm">
                    Click "Add Files" to upload documents
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.type} •{" "}
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB •{" "}
                            {formatDate(attachment.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Created: {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Updated: {formatDate(order.updatedAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 break-words">
                  Contact: {order.contactPerson}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 break-all">
                  {order.emailAddress}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {order.requesterMobile1}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 break-words">
                    {order.billingAccount.custName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Account: {order.billingAccount.custAccount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Chain ID: {order.billingAccount.companyChainId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Created: {formatDate(order.billingAccount.createdDate)}
                  </p>
                </div>
                <div>
                  <Badge
                    variant={
                      order.billingAccount.blocked ? "destructive" : "default"
                    }
                  >
                    {order.billingAccount.blocked ? "Blocked" : "Active"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
