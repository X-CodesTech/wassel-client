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
      {/* Order ID and CTA Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order info</h1>
          <h2 className="text-3xl font-bold text-blue-600">{order._id}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-purple-600 text-white">
            Ready for processing
          </Badge>
          <div className="flex flex-col space-y-2">
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

      {/* Order Info - Full Width */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="font-medium text-gray-700">Created date:</p>
              <p className="text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Service:</p>
              <p className="text-gray-900">{order.service}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Contact:</p>
              <p className="text-gray-900 break-words">{order.contactPerson}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Types of goods:</p>
              <p className="text-gray-900">{order.typesOfGoods}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Customer:</p>
              <p className="text-gray-900 break-words">
                {order.billingAccount.custName}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Status:</p>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                Active
              </Badge>
            </div>
            <div>
              <p className="font-medium text-gray-700">Type:</p>
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
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Required Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Required service details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              <li className="text-sm">Service: {order.service}</li>
              <li className="text-sm">Types of goods: {order.typesOfGoods}</li>
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
                  <TableHead className="w-1/4">{order.requesterName}</TableHead>
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
                  <TableCell className="font-medium">Billing Account</TableCell>
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
                    <p className="font-medium text-gray-700">Pickup address:</p>
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
                    <p className="font-medium text-gray-700">Delivery notes:</p>
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
                  <p className="text-gray-900">{order.shippingDetails.dimM}</p>
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
                  <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Updated:</p>
                  <p className="text-gray-900">{formatDate(order.updatedAt)}</p>
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
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                    <span className="col-span-1">PL#</span>
                    <span className="col-span-2">Service</span>
                    <span className="col-span-2">Description</span>
                    <span className="col-span-1">QTY</span>
                    <span className="col-span-3">Cost Window</span>
                    <span className="col-span-2">Vendors</span>
                    <span className="col-span-1">Cost</span>
                  </div>
                </div>

                {/* Truck Type Matches Rows */}
                {order.truckTypeMatches.map((item, index) => (
                  <div key={`truck-${index}`} className="p-4 border-b">
                    <div className="grid grid-cols-12 gap-4 text-sm">
                      <span
                        className="col-span-1 text-blue-600 cursor-pointer hover:underline"
                        title="Click to view customer price line"
                        onClick={() => navigate("/pricelists/PL-001")}
                      >
                        PL-001
                      </span>
                      <span
                        className="col-span-2 truncate"
                        title={item.subActivityName}
                      >
                        {item.subActivityName}
                      </span>
                      <span
                        className="col-span-2 truncate"
                        title={`${item.locationDetails.fromLocation} → ${item.locationDetails.toLocation}`}
                      >
                        {item.locationDetails.fromLocation} →{" "}
                        {item.locationDetails.toLocation}
                      </span>
                      <span className="col-span-1">-</span>
                      <span className="col-span-3">
                        <div className="relative w-full h-20">
                          {/* Gradient Bar */}
                          <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full mt-2"></div>

                          {/* Central Reference Line */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-20 bg-blue-600"></div>
                          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600">
                            $2,000
                          </div>

                          {/* Vendor Markers */}
                          <div className="absolute top-0 left-[15%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                          <div className="absolute top-16 left-[15%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                            <div className="text-xs font-medium">40%</div>
                            <div className="text-xs">$1,500</div>
                            <div className="text-xs font-bold">WSL</div>
                          </div>

                          <div className="absolute top-0 left-[30%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                          <div className="absolute top-16 left-[30%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                            <div className="text-xs font-medium">39%</div>
                            <div className="text-xs">$2,020</div>
                            <div className="text-xs font-bold">RDL</div>
                          </div>

                          <div className="absolute top-0 left-[65%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                          <div className="absolute top-16 left-[65%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                            <div className="text-xs font-medium">-13%</div>
                            <div className="text-xs">$2,250</div>
                            <div className="text-xs font-bold">ABK</div>
                          </div>

                          <div className="absolute top-0 left-[85%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                          <div className="absolute top-16 left-[85%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                            <div className="text-xs font-medium">-50%</div>
                            <div className="text-xs">$3,000</div>
                            <div className="text-xs font-bold">LSK</div>
                          </div>
                        </div>
                      </span>
                      <span className="col-span-2">
                        <select className="w-full p-1 text-xs border rounded">
                          <option value="">Select Vendor</option>
                          <option value="vendor1">Wassel</option>
                          <option value="vendor2">Vendor 2</option>
                        </select>
                      </span>
                      <span className="col-span-1">${item.cost}</span>
                    </div>
                  </div>
                ))}

                {/* Pickup Special Requirements Rows */}
                {order.specialRequirementsPrices.pickupSpecialRequirements.map(
                  (item, index) => (
                    <div key={`pickup-sr-${index}`} className="p-4 border-b">
                      <div className="grid grid-cols-12 gap-4 text-sm">
                        <span
                          className="col-span-1 text-blue-600 cursor-pointer hover:underline"
                          title="Click to view customer price line"
                          onClick={() => navigate("/pricelists/PL-002")}
                        >
                          PL-002
                        </span>
                        <span
                          className="col-span-2 truncate"
                          title={item.subActivityName}
                        >
                          {item.subActivityName}
                        </span>
                        <span className="col-span-2">-</span>
                        <span className="col-span-1">-</span>
                        <span className="col-span-3">
                          <div className="relative w-full h-20">
                            {/* Gradient Bar */}
                            <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full mt-2"></div>

                            {/* Central Reference Line */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-20 bg-blue-600"></div>
                            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600">
                              $1,500
                            </div>

                            {/* Vendor Markers */}
                            <div className="absolute top-0 left-[25%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                            <div className="absolute top-16 left-[25%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                              <div className="text-xs font-medium">20%</div>
                              <div className="text-xs">$1,200</div>
                              <div className="text-xs font-bold">WSL</div>
                            </div>

                            <div className="absolute top-0 left-[75%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                            <div className="absolute top-16 left-[75%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                              <div className="text-xs font-medium">-20%</div>
                              <div className="text-xs">$1,800</div>
                              <div className="text-xs font-bold">ABK</div>
                            </div>
                          </div>
                        </span>
                        <span className="col-span-2">
                          <select className="w-full p-1 text-xs border rounded">
                            <option value="">Select Vendor</option>
                            <option value="vendor1">Wassel</option>
                            <option value="vendor2">Vendor 2</option>
                          </select>
                        </span>
                        <span className="col-span-1">${item.cost}</span>
                      </div>
                    </div>
                  )
                )}

                {/* Delivery Special Requirements Rows */}
                {order.specialRequirementsPrices.deliverySpecialRequirements.map(
                  (item, index) => (
                    <div key={`delivery-sr-${index}`} className="p-4 border-b">
                      <div className="grid grid-cols-12 gap-4 text-sm">
                        <span
                          className="col-span-1 text-blue-600 cursor-pointer hover:underline"
                          title="Click to view customer price line"
                          onClick={() => navigate("/pricelists/PL-003")}
                        >
                          PL-003
                        </span>
                        <span
                          className="col-span-2 truncate"
                          title={item.subActivityName}
                        >
                          {item.subActivityName}
                        </span>
                        <span className="col-span-2">-</span>
                        <span className="col-span-1">-</span>
                        <span className="col-span-3">
                          <div className="relative w-full h-20">
                            {/* Gradient Bar */}
                            <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full mt-2"></div>

                            {/* Central Reference Line */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-20 bg-blue-600"></div>
                            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600">
                              $1,800
                            </div>

                            {/* Vendor Markers */}
                            <div className="absolute top-0 left-[30%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                            <div className="absolute top-16 left-[30%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                              <div className="text-xs font-medium">28%</div>
                              <div className="text-xs">$1,300</div>
                              <div className="text-xs font-bold">WSL</div>
                            </div>

                            <div className="absolute top-0 left-[80%] transform -translate-x-1/2 w-0.5 h-16 bg-gray-800"></div>
                            <div className="absolute top-16 left-[80%] transform -translate-x-1/2 text-xs text-center min-w-[70px]">
                              <div className="text-xs font-medium">-33%</div>
                              <div className="text-xs">$2,400</div>
                              <div className="text-xs font-bold">LSK</div>
                            </div>
                          </div>
                        </span>
                        <span className="col-span-2">
                          <select className="w-full p-1 text-xs border rounded">
                            <option value="">Select Vendor</option>
                            <option value="vendor1">Wassel</option>
                            <option value="vendor2">Vendor 2</option>
                          </select>
                        </span>
                        <span className="col-span-1">${item.cost}</span>
                      </div>
                    </div>
                  )
                )}
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
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Cost:{" "}
                      <span className="font-medium text-gray-900">
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
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Profit margin:{" "}
                      <span className="font-medium text-gray-900">
                        {(() => {
                          const totalPrice =
                            order.truckTypeMatches.reduce(
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
                            );
                          const totalCost =
                            order.truckTypeMatches.reduce(
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
                            );
                          return totalPrice > 0
                            ? (
                                ((totalPrice - totalCost) / totalPrice) *
                                100
                              ).toFixed(1) + "%"
                            : "0%";
                        })()}
                      </span>
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
                <p className="text-sm">Click "Add Files" to upload documents</p>
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
                        <p className="font-medium text-sm">{attachment.name}</p>
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
    </div>
  );
}
