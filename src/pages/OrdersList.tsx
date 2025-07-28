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
import { useVendorCost } from "@/hooks/useVendorCost";
import { CostWindow } from "@/components/InitialPriceOffer/CostWindow";
import { VendorDropdown } from "@/components/InitialPriceOffer/VendorDropdown";
import { UpdatePriceCostModal } from "@/components/UpdatePriceCostModal";
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
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrdersList() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { getOrderById, loading, error, currentOrder } = useOrders();
  const { fetchVendorCost, getVendorCostByKey, isLoadingByKey, getErrorByKey } =
    useVendorCost();
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
  const [dragOver, setDragOver] = useState(false);
  const [ipoActions, setIpoActions] = useState({
    updatePrice: false,
    updateCost: false,
  });

  // State for tracking vendor selections and costs
  const [selectedVendors, setSelectedVendors] = useState<
    Record<string, string>
  >({});
  const [selectedCosts, setSelectedCosts] = useState<Record<string, number>>(
    {}
  );

  // State for tracking which cost windows are opened
  const [openedCostWindows, setOpenedCostWindows] = useState<
    Record<string, boolean>
  >({});

  // State for update price/cost modal
  const [updateModal, setUpdateModal] = useState<{
    isOpen: boolean;
    type: "price" | "cost";
    serviceKey: string;
    currentValue: number;
    serviceName: string;
    serviceType: "truck" | "pickup" | "delivery";
    itemIndex: number;
  }>({
    isOpen: false,
    type: "price",
    serviceKey: "",
    currentValue: 0,
    serviceName: "",
    serviceType: "truck",
    itemIndex: 0,
  });

  // State for custom price/cost overrides
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(
    {}
  );
  const [costOverrides, setCostOverrides] = useState<Record<string, number>>(
    {}
  );

  // Handle vendor selection
  const handleVendorChange = (
    serviceKey: string,
    vendorId: string,
    cost: number
  ) => {
    setSelectedVendors((prev) => ({ ...prev, [serviceKey]: vendorId }));

    // Only update cost if there's no manual cost override
    if (!costOverrides[serviceKey]) {
      setSelectedCosts((prev) => ({ ...prev, [serviceKey]: cost }));
    }
  };

  // Generate unique key for each service item
  const generateServiceKey = (
    type: string,
    index: number,
    subActivityId?: string
  ) => {
    return `${type}-${index}-${subActivityId || ""}`;
  };

  // Handle opening a cost window and fetching vendor data
  const handleOpenCostWindow = useCallback(
    (serviceKey: string, subActivityId: string, locationParams?: any) => {
      // Mark as opened
      setOpenedCostWindows((prev) => ({ ...prev, [serviceKey]: true }));

      // Fetch vendor data if not already loaded
      if (!getVendorCostByKey(serviceKey)) {
        const params = {
          subActivityId,
          ...(locationParams?.location && {
            location: locationParams.location,
          }),
          ...(locationParams?.fromLocation && {
            fromLocation: locationParams.fromLocation,
          }),
          ...(locationParams?.toLocation && {
            toLocation: locationParams.toLocation,
          }),
        };

        fetchVendorCost(params, serviceKey);
      }
    },
    [fetchVendorCost, getVendorCostByKey]
  );

  // File upload function
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !orderId) return;

    setUploading(true);

    // Add files to local state immediately for better UX
    const newAttachments = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);

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
      // Remove files from state if upload failed
      setAttachments((prev) =>
        prev.filter(
          (att) => !newAttachments.find((newAtt) => newAtt.id === att.id)
        )
      );
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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Remove attachment
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
    toast({
      title: "Attachment Removed",
      description: "File has been removed from the list",
    });
  };

  // IPO Actions handlers
  const handleUpdatePrice = (
    serviceKey: string,
    currentPrice: number,
    serviceName: string,
    serviceType: "truck" | "pickup" | "delivery",
    itemIndex: number
  ) => {
    setUpdateModal({
      isOpen: true,
      type: "price",
      serviceKey,
      currentValue: currentPrice,
      serviceName,
      serviceType,
      itemIndex,
    });
  };

  const handleUpdateCost = (
    serviceKey: string,
    currentCost: number,
    serviceName: string,
    serviceType: "truck" | "pickup" | "delivery",
    itemIndex: number
  ) => {
    setUpdateModal({
      isOpen: true,
      type: "cost",
      serviceKey,
      currentValue: currentCost,
      serviceName,
      serviceType,
      itemIndex,
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setUpdateModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Reset IPO actions (only when submitting or cancelling)
  const resetIpoActions = () => {
    setIpoActions({ updatePrice: false, updateCost: false });
  };

  // Clear cost override to use vendor cost
  const clearCostOverride = (serviceKey: string) => {
    setCostOverrides((prev) => {
      const newOverrides = { ...prev };
      delete newOverrides[serviceKey];
      return newOverrides;
    });

    toast({
      title: "Cost Override Cleared",
      description: "Now using vendor cost",
    });
  };

  // Handle price/cost update
  const handlePriceCostUpdate = (newValue: number) => {
    const { type, serviceKey } = updateModal;

    if (type === "price") {
      setPriceOverrides((prev) => ({ ...prev, [serviceKey]: newValue }));
    } else {
      setCostOverrides((prev) => ({ ...prev, [serviceKey]: newValue }));
    }

    handleModalClose();

    toast({
      title: `${type === "price" ? "Price" : "Cost"} Updated`,
      description: `Successfully updated ${type} to $${newValue}`,
    });
  };

  const handleSubmitIPO = async () => {
    try {
      // TODO: Implement POST endpoint call
      // const response = await fetch('/api/ipo/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId, ipoActions })
      // });

      toast({
        title: "IPO Submitted",
        description: "Initial Price Offer has been submitted successfully",
      });

      // Reset actions after successful submission
      resetIpoActions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit IPO",
        variant: "destructive",
      });
    }
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
    if (!location) return "N/A";
    return `${location.country || "N/A"}, ${location.area || "N/A"}, ${
      location.city || "N/A"
    }`;
  };

  // Helper function to format special requirements
  const formatSpecialRequirements = (requirements: any[]) => {
    if (!requirements || !Array.isArray(requirements)) return [];
    return requirements.map(
      (req) =>
        `${req.quantity || 0} x ${
          req.subActivity?.portalItemNameEn || "Unknown"
        }${req.note ? ` - ${req.note}` : ""}`
    );
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Order ID and CTA Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order info</h1>
          <h2 className="text-3xl font-bold text-blue-600">
            {order.orderIndex || order._id}
          </h2>
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
                {order.billingAccount?.custName || "N/A"}
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
                    title={order.billingAccount?.custName || "N/A"}
                  >
                    {order.billingAccount?.custName || "N/A"}
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
        {(order.pickupInfo || []).map((pickup, index) => (
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
                      {pickup.pickupCoordinator?.requesterName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Pickup coordinator mobile 1:
                    </p>
                    <p className="text-gray-900">
                      {pickup.pickupCoordinator?.requesterMobile1 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Pickup coordinator mobile 2:
                    </p>
                    <p className="text-gray-900">
                      {pickup.pickupCoordinator?.requesterMobile2 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email:</p>
                    <p className="text-gray-900 break-all">
                      {pickup.pickupCoordinator?.emailAddress || "N/A"}
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
        {(order.deliveryInfo || []).map((delivery, index) => (
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
                      {delivery.deliveryCoordinator?.requesterName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Delivery coordinator mobile 1:
                    </p>
                    <p className="text-gray-900">
                      {delivery.deliveryCoordinator?.requesterMobile1 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Delivery coordinator mobile 2:
                    </p>
                    <p className="text-gray-900">
                      {delivery.deliveryCoordinator?.requesterMobile2 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email:</p>
                    <p className="text-gray-900 break-all">
                      {delivery.deliveryCoordinator?.emailAddress || "N/A"}
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
                    {order.shippingDetails.shippingUnits?.activityNameEn ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Type of truck:</p>
                  <p className="text-gray-900">
                    {order.shippingDetails.typeOfTruck?.portalItemNameEn ||
                      "N/A"}
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
                    {(order.truckTypeMatches || []).reduce(
                      (sum, item) => sum + (item.price || 0),
                      0
                    ) +
                      (
                        order.specialRequirementsPrices
                          ?.pickupSpecialRequirements || []
                      ).reduce(
                        (sum, item) =>
                          sum +
                          (item.basePrice || 0) +
                          (item.locationPrice || 0),
                        0
                      ) +
                      (
                        order.specialRequirementsPrices
                          ?.deliverySpecialRequirements || []
                      ).reduce(
                        (sum, item) =>
                          sum +
                          (item.basePrice || 0) +
                          (item.locationPrice || 0),
                        0
                      )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Total Cost:</p>
                  <p className="text-gray-900 text-lg font-semibold">
                    $
                    {(order.truckTypeMatches || []).reduce(
                      (sum, item) => sum + (item.cost || 0),
                      0
                    ) +
                      (
                        order.specialRequirementsPrices
                          ?.pickupSpecialRequirements || []
                      ).reduce((sum, item) => sum + (item.cost || 0), 0) +
                      (
                        order.specialRequirementsPrices
                          ?.deliverySpecialRequirements || []
                      ).reduce((sum, item) => sum + (item.cost || 0), 0)}
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
                <h3 className="font-bold text-lg">
                  IPO-{order.orderIndex || order._id}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                <Button size="sm" className="bg-blue-600">
                  Submit this IPO
                </Button>
                <Button size="sm" className="bg-blue-600">
                  Add service line +
                </Button>
                <Button size="sm" className="bg-blue-600">
                  Download excel
                </Button>
                <Button size="sm" className="bg-blue-600">
                  Print IPO
                </Button>
              </div>

              {/* Service Lines Table */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <div className="min-w-auto">
                    {/* Header Row */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b sticky top-0 z-10">
                      <div
                        className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700"
                        style={{
                          gridTemplateColumns:
                            "60px 120px 1fr 40px 60px 300px 100px 50px 50px",
                        }}
                      >
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                            PL#
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                            Service
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">
                            Description
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold">
                            QTY
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                            Price
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                            Cost Window
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold">
                            Vendors
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                            Cost
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">
                            Actions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Truck Type Matches Rows */}
                    {(order.truckTypeMatches || []).map((item, index) => {
                      const serviceKey = generateServiceKey(
                        "truck",
                        index,
                        item.subActivityId
                      );
                      const vendorCostData = getVendorCostByKey(serviceKey);
                      const isLoadingVendors = isLoadingByKey(serviceKey);
                      const selectedCost =
                        costOverrides[serviceKey] ??
                        selectedCosts[serviceKey] ??
                        item.cost ??
                        0;

                      return (
                        <div
                          key={`truck-${index}`}
                          className="p-4 border-b hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div
                            className="grid gap-2 text-sm items-start py-2"
                            style={{
                              gridTemplateColumns:
                                "60px 120px 1fr 40px 60px 300px 100px 50px 50px",
                            }}
                          >
                            <div>
                              <span
                                className="text-blue-600 cursor-pointer hover:underline font-medium text-xs leading-tight"
                                title="Click to view customer price line"
                                onClick={() =>
                                  navigate(`/pricelists/${item.priceListId}`)
                                }
                              >
                                {item.priceListName}
                              </span>
                            </div>
                            <div>
                              <span
                                className="font-medium text-xs leading-tight break-words"
                                title={item.subActivityName}
                              >
                                {item.subActivityName}
                              </span>
                            </div>
                            <div>
                              <span
                                className="text-gray-700 text-xs leading-tight break-words"
                                title={`${
                                  item.locationDetails?.fromLocation || "N/A"
                                } → ${
                                  item.locationDetails?.toLocation || "N/A"
                                }`}
                              >
                                {item.locationDetails?.fromLocation || "N/A"} →{" "}
                                {item.locationDetails?.toLocation || "N/A"}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-gray-900 text-xs">
                                {order.shippingDetails?.qty || 1}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-green-600 text-xs">
                                ${priceOverrides[serviceKey] ?? item.price ?? 0}
                              </span>
                            </div>
                            <div>
                              {openedCostWindows[serviceKey] ? (
                                <CostWindow
                                  vendorData={vendorCostData?.data || []}
                                  costRange={
                                    vendorCostData?.costRange || {
                                      min: 0,
                                      max: 0,
                                      average: 0,
                                      count: 0,
                                      totalVendors: 0,
                                    }
                                  }
                                  customerPrice={item.price}
                                  loading={isLoadingVendors}
                                />
                              ) : (
                                <button
                                  onClick={() =>
                                    handleOpenCostWindow(
                                      serviceKey,
                                      item.subActivityId,
                                      {
                                        fromLocation:
                                          item.locationDetails?.fromLocation,
                                        toLocation:
                                          item.locationDetails?.toLocation,
                                      }
                                    )
                                  }
                                  className="relative w-full h-12 bg-gray-50 rounded-lg p-1 border hover:bg-gray-100 transition-colors flex items-center justify-center group"
                                >
                                  <div className="text-center">
                                    <div className="text-xs text-gray-600 font-medium">
                                      Click to view
                                    </div>
                                    <div className="text-xs text-blue-600 font-semibold">
                                      Cost Comparison
                                    </div>
                                  </div>
                                  <div className="absolute right-2 text-gray-400 group-hover:text-gray-600">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                </button>
                              )}
                            </div>
                            <div>
                              <VendorDropdown
                                vendorData={vendorCostData?.data || []}
                                selectedVendor={selectedVendors[serviceKey]}
                                onVendorChange={(vendorId, cost) =>
                                  handleVendorChange(serviceKey, vendorId, cost)
                                }
                                loading={isLoadingVendors}
                              />
                            </div>
                            <div className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-red-600 text-xs">
                                  ${costOverrides[serviceKey] ?? selectedCost}
                                </span>
                                {costOverrides[serviceKey] && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    Override
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdatePrice(
                                        serviceKey,
                                        priceOverrides[serviceKey] ??
                                          item.price ??
                                          0,
                                        item.subActivityName || "Service",
                                        "truck",
                                        index
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Price
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateCost(
                                        serviceKey,
                                        costOverrides[serviceKey] ??
                                          selectedCosts[serviceKey] ??
                                          item.cost ??
                                          0,
                                        item.subActivityName || "Service",
                                        "truck",
                                        index
                                      )
                                    }
                                  >
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Update Cost
                                  </DropdownMenuItem>
                                  {costOverrides[serviceKey] && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        clearCostOverride(serviceKey)
                                      }
                                      className="text-orange-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Clear Cost Override
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pickup Special Requirements Rows */}
                    {(
                      order.specialRequirementsPrices
                        ?.pickupSpecialRequirements || []
                    ).map((item, index) => {
                      const serviceKey = generateServiceKey(
                        "pickup",
                        index,
                        item.subActivityId
                      );
                      const vendorCostData = getVendorCostByKey(serviceKey);
                      const isLoadingVendors = isLoadingByKey(serviceKey);
                      const selectedCost =
                        costOverrides[serviceKey] ??
                        selectedCosts[serviceKey] ??
                        item.cost ??
                        0;
                      const totalPrice =
                        (item.basePrice || 0) + (item.locationPrice || 0);
                      const displayPrice =
                        priceOverrides[serviceKey] ?? totalPrice;

                      return (
                        <div
                          key={`pickup-sr-${index}`}
                          className="p-4 border-b hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div
                            className="grid gap-2 text-sm items-start py-2"
                            style={{
                              gridTemplateColumns:
                                "60px 120px 1fr 40px 60px 300px 100px 50px 50px",
                            }}
                          >
                            <div>
                              <span
                                className="text-blue-600 cursor-pointer hover:underline font-medium text-xs leading-tight"
                                title="Click to view customer price line"
                                onClick={() =>
                                  navigate(`/pricelists/${item.priceListId}`)
                                }
                              >
                                {item.priceListName}
                              </span>
                            </div>
                            <div>
                              <span
                                className="font-medium text-xs leading-tight break-words"
                                title={item.subActivityName}
                              >
                                {item.subActivityName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">-</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-gray-900 text-xs">
                                {item.quantity || 1}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-green-600 text-xs">
                                ${displayPrice}
                              </span>
                            </div>
                            <div>
                              {openedCostWindows[serviceKey] ? (
                                <CostWindow
                                  vendorData={vendorCostData?.data || []}
                                  costRange={
                                    vendorCostData?.costRange || {
                                      min: 0,
                                      max: 0,
                                      average: 0,
                                      count: 0,
                                      totalVendors: 0,
                                    }
                                  }
                                  customerPrice={displayPrice}
                                  loading={isLoadingVendors}
                                />
                              ) : (
                                <button
                                  onClick={() =>
                                    handleOpenCostWindow(
                                      serviceKey,
                                      item.subActivityId
                                    )
                                  }
                                  className="relative w-full h-12 bg-gray-50 rounded-lg p-1 border hover:bg-gray-100 transition-colors flex items-center justify-center group"
                                >
                                  <div className="text-center">
                                    <div className="text-xs text-gray-600 font-medium">
                                      Click to view
                                    </div>
                                    <div className="text-xs text-blue-600 font-semibold">
                                      Cost Comparison
                                    </div>
                                  </div>
                                  <div className="absolute right-2 text-gray-400 group-hover:text-gray-600">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                </button>
                              )}
                            </div>
                            <div>
                              {openedCostWindows[serviceKey] ? (
                                <VendorDropdown
                                  vendorData={vendorCostData?.data || []}
                                  selectedVendor={selectedVendors[serviceKey]}
                                  onVendorChange={(vendorId, cost) =>
                                    handleVendorChange(
                                      serviceKey,
                                      vendorId,
                                      cost
                                    )
                                  }
                                  loading={isLoadingVendors}
                                />
                              ) : (
                                <select
                                  className="w-full p-1 text-xs border rounded-md bg-gray-100"
                                  disabled
                                >
                                  <option>Open cost window first</option>
                                </select>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-red-600 text-xs">
                                  ${selectedCost}
                                </span>
                                {costOverrides[serviceKey] && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    Override
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdatePrice(
                                        serviceKey,
                                        priceOverrides[serviceKey] ??
                                          totalPrice,
                                        item.subActivityName ||
                                          "Pickup Special Requirement",
                                        "pickup",
                                        index
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Price
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateCost(
                                        serviceKey,
                                        costOverrides[serviceKey] ??
                                          selectedCosts[serviceKey] ??
                                          item.cost ??
                                          0,
                                        item.subActivityName ||
                                          "Pickup Special Requirement",
                                        "pickup",
                                        index
                                      )
                                    }
                                  >
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Update Cost
                                  </DropdownMenuItem>
                                  {costOverrides[serviceKey] && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        clearCostOverride(serviceKey)
                                      }
                                      className="text-orange-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Clear Cost Override
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Delivery Special Requirements Rows */}
                    {(
                      order.specialRequirementsPrices
                        ?.deliverySpecialRequirements || []
                    ).map((item, index) => {
                      const serviceKey = generateServiceKey(
                        "delivery",
                        index,
                        item.subActivityId
                      );
                      const vendorCostData = getVendorCostByKey(serviceKey);
                      const isLoadingVendors = isLoadingByKey(serviceKey);
                      const selectedCost =
                        costOverrides[serviceKey] ??
                        selectedCosts[serviceKey] ??
                        item.cost ??
                        0;
                      const totalPrice =
                        (item.basePrice || 0) + (item.locationPrice || 0);
                      const displayPrice =
                        priceOverrides[serviceKey] ?? totalPrice;

                      return (
                        <div
                          key={`delivery-sr-${index}`}
                          className="p-4 border-b hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div
                            className="grid gap-2 text-sm items-start py-2"
                            style={{
                              gridTemplateColumns:
                                "60px 120px 1fr 40px 60px 300px 100px 50px 50px",
                            }}
                          >
                            <div>
                              <span
                                className="text-blue-600 cursor-pointer hover:underline font-medium text-xs leading-tight"
                                title="Click to view customer price line"
                                onClick={() =>
                                  navigate(`/pricelists/${item.priceListId}`)
                                }
                              >
                                {item.priceListName}
                              </span>
                            </div>
                            <div>
                              <span
                                className="font-medium text-xs leading-tight break-words"
                                title={item.subActivityName}
                              >
                                {item.subActivityName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">-</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-gray-900 text-xs">
                                {item.quantity || 1}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-green-600 text-xs">
                                ${displayPrice}
                              </span>
                            </div>
                            <div>
                              {openedCostWindows[serviceKey] ? (
                                <CostWindow
                                  vendorData={vendorCostData?.data || []}
                                  costRange={
                                    vendorCostData?.costRange || {
                                      min: 0,
                                      max: 0,
                                      average: 0,
                                      count: 0,
                                      totalVendors: 0,
                                    }
                                  }
                                  customerPrice={displayPrice}
                                  loading={isLoadingVendors}
                                />
                              ) : (
                                <button
                                  onClick={() =>
                                    handleOpenCostWindow(
                                      serviceKey,
                                      item.subActivityId
                                    )
                                  }
                                  className="relative w-full h-12 bg-gray-50 rounded-lg p-1 border hover:bg-gray-100 transition-colors flex items-center justify-center group"
                                >
                                  <div className="text-center">
                                    <div className="text-xs text-gray-600 font-medium">
                                      Click to view
                                    </div>
                                    <div className="text-xs text-blue-600 font-semibold">
                                      Cost Comparison
                                    </div>
                                  </div>
                                  <div className="absolute right-2 text-gray-400 group-hover:text-gray-600">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                </button>
                              )}
                            </div>
                            <div>
                              {openedCostWindows[serviceKey] ? (
                                <VendorDropdown
                                  vendorData={vendorCostData?.data || []}
                                  selectedVendor={selectedVendors[serviceKey]}
                                  onVendorChange={(vendorId, cost) =>
                                    handleVendorChange(
                                      serviceKey,
                                      vendorId,
                                      cost
                                    )
                                  }
                                  loading={isLoadingVendors}
                                />
                              ) : (
                                <select
                                  className="w-full p-1 text-xs border rounded-md bg-gray-100"
                                  disabled
                                >
                                  <option>Open cost window first</option>
                                </select>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-red-600 text-xs">
                                  ${selectedCost}
                                </span>
                                {costOverrides[serviceKey] && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    Override
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdatePrice(
                                        serviceKey,
                                        priceOverrides[serviceKey] ??
                                          totalPrice,
                                        item.subActivityName ||
                                          "Delivery Special Requirement",
                                        "delivery",
                                        index
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Price
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateCost(
                                        serviceKey,
                                        costOverrides[serviceKey] ??
                                          selectedCosts[serviceKey] ??
                                          item.cost ??
                                          0,
                                        item.subActivityName ||
                                          "Delivery Special Requirement",
                                        "delivery",
                                        index
                                      )
                                    }
                                  >
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Update Cost
                                  </DropdownMenuItem>
                                  {costOverrides[serviceKey] && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        clearCostOverride(serviceKey)
                                      }
                                      className="text-orange-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Clear Cost Override
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* IPO Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Initial Price Offer Summary</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Selling price:
                    </span>
                    <span className="font-medium text-gray-900">
                      $
                      {(order.truckTypeMatches || []).reduce(
                        (sum, item, index) => {
                          const serviceKey = generateServiceKey(
                            "truck",
                            index,
                            item.subActivityId
                          );
                          const price =
                            priceOverrides[serviceKey] ?? item.price ?? 0;
                          return (
                            sum + price * (order.shippingDetails?.qty || 1)
                          );
                        },
                        0
                      ) +
                        (
                          order.specialRequirementsPrices
                            ?.pickupSpecialRequirements || []
                        ).reduce((sum, item, index) => {
                          const serviceKey = generateServiceKey(
                            "pickup",
                            index,
                            item.subActivityId
                          );
                          const price =
                            priceOverrides[serviceKey] ??
                            (item.basePrice || 0) + (item.locationPrice || 0);
                          return sum + price;
                        }, 0) +
                        (
                          order.specialRequirementsPrices
                            ?.deliverySpecialRequirements || []
                        ).reduce((sum, item, index) => {
                          const serviceKey = generateServiceKey(
                            "delivery",
                            index,
                            item.subActivityId
                          );
                          const price =
                            priceOverrides[serviceKey] ??
                            (item.basePrice || 0) + (item.locationPrice || 0);
                          return sum + price;
                        }, 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className="font-medium text-gray-900">
                      $
                      {(() => {
                        // Calculate total cost using selected vendor costs
                        let totalCost = 0;

                        // Truck type matches
                        (order.truckTypeMatches || []).forEach(
                          (item, index) => {
                            const serviceKey = generateServiceKey(
                              "truck",
                              index,
                              item.subActivityId
                            );
                            const cost =
                              costOverrides[serviceKey] ??
                              selectedCosts[serviceKey] ??
                              item.cost ??
                              0;
                            totalCost +=
                              cost * (order.shippingDetails?.qty || 1);
                          }
                        );

                        // Pickup special requirements
                        (
                          order.specialRequirementsPrices
                            ?.pickupSpecialRequirements || []
                        ).forEach((item, index) => {
                          const serviceKey = generateServiceKey(
                            "pickup",
                            index,
                            item.subActivityId
                          );
                          const cost =
                            costOverrides[serviceKey] ??
                            selectedCosts[serviceKey] ??
                            item.cost ??
                            0;
                          totalCost += cost * (item.quantity || 1);
                        });

                        // Delivery special requirements
                        (
                          order.specialRequirementsPrices
                            ?.deliverySpecialRequirements || []
                        ).forEach((item, index) => {
                          const serviceKey = generateServiceKey(
                            "delivery",
                            index,
                            item.subActivityId
                          );
                          const cost =
                            costOverrides[serviceKey] ??
                            selectedCosts[serviceKey] ??
                            item.cost ??
                            0;
                          totalCost += cost * (item.quantity || 1);
                        });

                        return totalCost;
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Profit margin:
                    </span>
                    <span className="font-medium text-gray-900">
                      {(() => {
                        let totalPrice = 0;

                        // Truck type matches
                        (order.truckTypeMatches || []).forEach(
                          (item, index) => {
                            const serviceKey = generateServiceKey(
                              "truck",
                              index,
                              item.subActivityId
                            );
                            const price =
                              priceOverrides[serviceKey] ?? item.price ?? 0;
                            totalPrice +=
                              price * (order.shippingDetails?.qty || 1);
                          }
                        );

                        // Pickup special requirements
                        (
                          order.specialRequirementsPrices
                            ?.pickupSpecialRequirements || []
                        ).forEach((item, index) => {
                          const serviceKey = generateServiceKey(
                            "pickup",
                            index,
                            item.subActivityId
                          );
                          const price =
                            priceOverrides[serviceKey] ??
                            (item.basePrice || 0) + (item.locationPrice || 0);
                          totalPrice += price;
                        });

                        // Delivery special requirements
                        (
                          order.specialRequirementsPrices
                            ?.deliverySpecialRequirements || []
                        ).forEach((item, index) => {
                          const serviceKey = generateServiceKey(
                            "delivery",
                            index,
                            item.subActivityId
                          );
                          const price =
                            priceOverrides[serviceKey] ??
                            (item.basePrice || 0) + (item.locationPrice || 0);
                          totalPrice += price;
                        });
                        // Calculate total cost using selected vendor costs
                        let totalCost = 0;

                        // Truck type matches
                        (order.truckTypeMatches || []).forEach(
                          (item, index) => {
                            const serviceKey = generateServiceKey(
                              "truck",
                              index,
                              item.subActivityId
                            );
                            const cost =
                              costOverrides[serviceKey] ??
                              selectedCosts[serviceKey] ??
                              item.cost ??
                              0;
                            totalCost +=
                              cost * (order.shippingDetails?.qty || 1);
                          }
                        );

                        // Pickup special requirements
                        (
                          order.specialRequirementsPrices
                            ?.pickupSpecialRequirements || []
                        ).forEach((item, index) => {
                          const serviceKey = generateServiceKey(
                            "pickup",
                            index,
                            item.subActivityId
                          );
                          const cost =
                            costOverrides[serviceKey] ??
                            selectedCosts[serviceKey] ??
                            item.cost ??
                            0;
                          totalCost += cost * (item.quantity || 1);
                        });

                        // Delivery special requirements
                        (
                          order.specialRequirementsPrices
                            ?.deliverySpecialRequirements || []
                        ).forEach((item, index) => {
                          const serviceKey = generateServiceKey(
                            "delivery",
                            index,
                            item.subActivityId
                          );
                          const cost =
                            costOverrides[serviceKey] ??
                            selectedCosts[serviceKey] ??
                            item.cost ??
                            0;
                          totalCost += cost * (item.quantity || 1);
                        });
                        return totalPrice > 0
                          ? (
                              ((totalPrice - totalCost) / totalPrice) *
                              100
                            ).toFixed(1) + "%"
                          : "0%";
                      })()}
                    </span>
                  </div>
                </div>

                {/* Action Status Indicators */}
                {(ipoActions.updatePrice || ipoActions.updateCost) && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-blue-800">
                          {ipoActions.updatePrice && "Price Update Mode Active"}
                          {ipoActions.updateCost && "Cost Update Mode Active"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSubmitIPO}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Submit IPO
                      </Button>
                    </div>
                  </div>
                )}
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
            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {dragOver ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click the button above to select files
              </p>
              <p className="text-xs text-gray-400">
                Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, and more
              </p>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Price/Cost Modal */}
      <UpdatePriceCostModal
        isOpen={updateModal.isOpen}
        onClose={handleModalClose}
        onUpdate={handlePriceCostUpdate}
        type={updateModal.type}
        currentValue={updateModal.currentValue}
        serviceName={updateModal.serviceName}
        loading={false}
      />
    </div>
  );
}
