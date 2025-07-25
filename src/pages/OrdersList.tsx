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
} from "lucide-react";

export default function OrdersList() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { getOrderById, loading, error, currentOrder } = useOrders();
  const [orderId, setOrderId] = useState<string | null>(null);

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
