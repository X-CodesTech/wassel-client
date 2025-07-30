import { CostWindow } from "@/components/InitialPriceOffer/CostWindow";
import { VendorDropdown } from "@/components/InitialPriceOffer/VendorDropdown";
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
import { Textarea } from "@/components/ui/textarea";
import { UpdatePriceCostModal } from "@/components/UpdatePriceCostModal";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useVendorCost } from "@/hooks/useVendorCost";
import http from "@/services/http";
import orderServices from "@/services/orderServices";
import { IActivity, ISubActivity, ITransaction } from "@/types/ModelTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actSubmitIPO } from "@/store/orders/act";

// Extended interface for sub-activity with API response structure
interface ISubActivityWithId extends ISubActivity {
  _id: string;
  transactionType: ITransaction & { _id: string };
  activity: IActivity & { _id: string };
}

import AttachmentModule from "@/components/AttachmentModule";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  DollarSign,
  Edit,
  FileText,
  MapPin,
  MoreHorizontal,
  Package,
  Truck,
  X,
} from "lucide-react";

export default function OrderDetails() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { getOrderById, loading, error, currentOrder } = useOrders();
  const dispatch = useAppDispatch();
  const ipoSubmissionLoading = useAppSelector(
    (state) => state.orders.ipoSubmissionLoading
  );
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
      url?: string;
      serverId?: string;
    }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
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

  // State for Add Service Line popover
  const [addServicePopoverOpen, setAddServicePopoverOpen] = useState(false);
  const [addingServiceLine, setAddingServiceLine] = useState(false);
  const [serviceLineForm, setServiceLineForm] = useState({
    serviceType: "perItem", // perItem or perLocation
    locationMode: "pickup", // pickup or delivery
    selectedLocation: "",
    selectedSubActivity: "",
    quantity: 1, // Minimum quantity of 1
    note: "", // Optional note
  });

  // State for sub-activities
  const [subActivities, setSubActivities] = useState<ISubActivityWithId[]>([]);
  const [loadingSubActivities, setLoadingSubActivities] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle vendor selection
  const handleVendorChange = async (
    serviceKey: string,
    vendorId: string,
    cost: number
  ) => {
    // Don't proceed if no vendor is selected (clearing selection)
    if (!vendorId) {
      setSelectedVendors((prev) => ({ ...prev, [serviceKey]: vendorId }));
      if (!costOverrides[serviceKey]) {
        setSelectedCosts((prev) => ({ ...prev, [serviceKey]: cost }));
      }
      return;
    }

    try {
      // Find the sub-activity data based on serviceKey
      const [type, indexStr, subActivityId] = serviceKey.split("-");
      const index = parseInt(indexStr);

      let subActivityData: any = null;
      let pricingMethod: string = "perItem";
      let locationParams: any = {};

      // Find the sub-activity data based on type
      if (type === "truck" && order.truckTypeMatches) {
        subActivityData = order.truckTypeMatches[index];
        pricingMethod = subActivityData?.pricingMethod || "perItem";
        locationParams = {
          fromLocation:
            subActivityData?.locationDetails?.fromLocationDetails?._id,
          toLocation: subActivityData?.locationDetails?.toLocationDetails?._id,
        };
      } else if (
        type === "pickup" &&
        order.specialRequirementsPrices?.pickupSpecialRequirements
      ) {
        subActivityData =
          order.specialRequirementsPrices.pickupSpecialRequirements[index];
        pricingMethod = subActivityData?.pricingMethod || "perItem";
        locationParams = {
          fromLocation:
            subActivityData?.locationDetails?.fromLocationDetails?._id,
          toLocation: subActivityData?.locationDetails?.toLocationDetails?._id,
        };
      } else if (
        type === "delivery" &&
        order.specialRequirementsPrices?.deliverySpecialRequirements
      ) {
        subActivityData =
          order.specialRequirementsPrices.deliverySpecialRequirements[index];
        pricingMethod = subActivityData?.pricingMethod || "perItem";
        locationParams = {
          fromLocation:
            subActivityData?.locationDetails?.fromLocationDetails?._id,
          toLocation: subActivityData?.locationDetails?.toLocationDetails?._id,
        };
      }

      if (!subActivityData) {
        toast({
          title: "Error",
          description: "Could not find sub-activity data",
          variant: "destructive",
        });
        return;
      }

      // Prepare the request data based on pricing method
      const requestData: any = {
        subActivityId: subActivityData.subActivityId || subActivityData._id,
        vendorId,
      };

      // Add location parameters based on pricing method
      if (pricingMethod === "perLocation") {
        if (locationParams.fromLocation) {
          requestData.locationId = locationParams.fromLocation;
        }
      } else if (pricingMethod === "perTrip") {
        if (locationParams.fromLocation) {
          requestData.fromLocationId = locationParams.fromLocation;
        }
        if (locationParams.toLocation) {
          requestData.toLocationId = locationParams.toLocation;
        }
      }
      // For perItem, no location parameters are needed

      // Call the API to update the vendor
      const response = await orderServices.updateVendor(order._id, requestData);

      if (response.success) {
        // Update local state
        setSelectedVendors((prev) => ({ ...prev, [serviceKey]: vendorId }));

        // Only update cost if there's no manual cost override
        if (!costOverrides[serviceKey]) {
          setSelectedCosts((prev) => ({ ...prev, [serviceKey]: cost }));
        }

        toast({
          title: "Vendor Updated",
          description: `Vendor updated to ${response.data.newVendor.name}`,
        });

        // Refresh the order data to get updated information
        if (orderId) {
          getOrderById(orderId);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update vendor",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update vendor",
        variant: "destructive",
      });
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
    (
      serviceKey: string,
      subActivityId: string,
      locationParams?: any,
      pricingMethod?: string
    ) => {
      // Mark as opened
      setOpenedCostWindows((prev) => ({ ...prev, [serviceKey]: true }));

      // Fetch vendor data if not already loaded
      if (!getVendorCostByKey(serviceKey)) {
        const params: any = {
          subActivityId,
        };

        // Determine location parameters based on pricing method
        if (pricingMethod === "perItem") {
          // For perItem pricing method, do NOT pass any location parameters
          // Only subActivityId is required
        } else if (pricingMethod === "perLocation") {
          // For perLocation pricing method, pass only location parameter
          if (locationParams?.location) {
            params.location = locationParams.location;
          } else if (locationParams?.fromLocation) {
            // Fallback: use fromLocation as location if no specific location provided
            params.location = locationParams.fromLocation;
          }
        } else if (pricingMethod === "perTrip") {
          // For perTrip pricing method, pass only fromLocation and toLocation
          if (locationParams?.fromLocation) {
            params.fromLocation = locationParams.fromLocation;
          }
          if (locationParams?.toLocation) {
            params.toLocation = locationParams.toLocation;
          }
        }

        console.log("Cost window params for", pricingMethod, ":", params);
        fetchVendorCost(params, serviceKey);
      }
    },
    [fetchVendorCost, getVendorCostByKey]
  );

  // File upload function
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    // Validate file types and sizes
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "text/csv",
    ];

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Get order ID from current order
        const orderId = order._id;

        const response = await http.post(
          `/api/v1/uploads/orders/${orderId}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return {
          id: response.data.id || Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          uploadedAt: new Date().toISOString(),
          url: response.data.url || URL.createObjectURL(file), // Use server URL or fallback to blob
          serverId: response.data.id, // Store server-side ID for future operations
        };
      });

      await Promise.all(uploadPromises);

      // Small delay to ensure server processing is complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh the files list from server to get the latest state
      await fetchOrderFiles(order._id);
      setUploading(false);

      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) uploaded to server`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);

      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
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

  // Get file icon based on file type
  const getFileIcon = (type: string) => {
    if (type.includes("image/")) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (type.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (type.includes("word") || type.includes("document")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (type.includes("excel") || type.includes("spreadsheet")) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the drag zone itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = async (attachmentId: string) => {
    const attachmentToRemove = attachments.find(
      (att) => att.id === attachmentId
    );

    if (!attachmentToRemove) {
      toast({
        title: "Error",
        description: "File not found",
        variant: "destructive",
      });
      return;
    }

    setDeletingFileId(attachmentId);

    try {
      // Get order ID and file name for the API call
      const orderId = order._id;
      const fileName = attachmentToRemove.serverId; // Use serverId which contains the actual server filename

      // Call the DELETE API endpoint
      await http.delete(`/api/v1/uploads/orders/${orderId}/files/${fileName}`);

      // Clean up blob URL for the deleted file (only for local blob URLs)
      const deletedAttachment = attachments.find(
        (att) => att.id === attachmentId
      );
      if (deletedAttachment?.url && deletedAttachment.url.startsWith("blob:")) {
        URL.revokeObjectURL(deletedAttachment.url);
      }

      // Refresh the files list from server to get the latest state
      await fetchOrderFiles(order._id);

      toast({
        title: "File Deleted",
        description: "File has been successfully removed from server",
      });
    } catch (error) {
      console.error("Delete file error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file from server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  // View attachment
  const handleViewAttachment = (attachment: any) => {
    if (attachment.url) {
      // Open in new tab for preview
      window.open(attachment.url, "_blank");
    } else {
      toast({
        title: "Preview not available",
        description: "This file cannot be previewed",
        variant: "destructive",
      });
    }
  };

  // Download attachment
  const handleDownloadAttachment = async (attachment: any) => {
    if (attachment.url) {
      try {
        // For server URLs, we can directly link to them
        if (attachment.url.startsWith("http")) {
          const link = document.createElement("a");
          link.href = attachment.url;
          link.download = attachment.name;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // For blob URLs (fallback), use the original method
          const link = document.createElement("a");
          link.href = attachment.url;
          link.download = attachment.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        toast({
          title: "Download started",
          description: `Downloading ${attachment.name}`,
        });
      } catch (error) {
        toast({
          title: "Download failed",
          description: "Failed to download the file",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Download not available",
        description: "This file cannot be downloaded",
        variant: "destructive",
      });
    }
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

  // Fetch sub-activities based on pricing method
  const fetchSubActivities = useCallback(
    async (pricingMethod: string) => {
      setLoadingSubActivities(true);
      try {
        const response = await http.get(
          `/api/v1/sub-activities/by-pricing-method?pricingMethods=${pricingMethod}`
        );

        // Handle the response structure with success and data fields
        if (response.data?.success && response.data?.data) {
          // Filter only active sub-activities
          const activeSubActivities = response.data.data.filter(
            (subActivity: ISubActivityWithId) => subActivity.isActive
          );
          setSubActivities(activeSubActivities);
        } else {
          setSubActivities([]);
        }
      } catch (error) {
        console.error("Error fetching sub-activities:", error);
        toast({
          title: "Error",
          description: "Failed to fetch sub-activities",
          variant: "destructive",
        });
        setSubActivities([]);
      } finally {
        setLoadingSubActivities(false);
      }
    },
    [toast]
  );

  // Handle service line form changes
  const handleServiceLineFormChange = (
    field: string,
    value: string | number
  ) => {
    setServiceLineForm((prev) => ({
      ...prev,
      [field]: value,
      // Reset selected location when changing location mode
      ...(field === "locationMode" && { selectedLocation: "" }),
      // Reset selected sub-activity when changing service type
      ...(field === "serviceType" && { selectedSubActivity: "" }),
    }));

    // Fetch sub-activities when service type changes
    if (field === "serviceType") {
      fetchSubActivities(value as string);
    }
  };

  // Handle add service line submission
  const handleAddServiceLine = async () => {
    console.log("=== ADD SERVICE LINE SUBMISSION ===");
    console.log("Service Line Form Data:", serviceLineForm);
    console.log("Order ID:", order?._id);

    if (!order?._id) {
      console.log("ERROR: Order ID not found");
      toast({
        title: "Error",
        description: "Order ID not found",
        variant: "destructive",
      });
      return;
    }

    setAddingServiceLine(true);

    // Declare requestBody outside try block for error logging
    let requestBody: any = undefined;

    try {
      // Find the selected sub-activity details
      const selectedSubActivityDetails = subActivities.find(
        (subActivity) => subActivity._id === serviceLineForm.selectedSubActivity
      );

      console.log("Available Sub-activities:", subActivities.length);
      console.log("Selected Sub-activity Details:", selectedSubActivityDetails);

      if (!selectedSubActivityDetails) {
        console.log("ERROR: Selected sub-activity not found", {
          selectedId: serviceLineForm.selectedSubActivity,
          availableIds: subActivities.map((sa) => sa._id),
        });
        toast({
          title: "Error",
          description: "Selected sub-activity not found",
          variant: "destructive",
        });
        return;
      }

      // Get selected location ID directly from form
      const selectedLocationId = serviceLineForm.selectedLocation;

      console.log("Selected Location ID:", selectedLocationId);
      console.log("Location Mode:", serviceLineForm.locationMode);

      if (!selectedLocationId || selectedLocationId.startsWith("fallback-")) {
        console.log("ERROR: Invalid location ID", {
          selectedLocationId,
          locationMode: serviceLineForm.locationMode,
        });
        toast({
          title: "Error",
          description: "Please select a valid location",
          variant: "destructive",
        });
        return;
      }

      // Construct the new special requirement entry
      const newSpecialRequirement = {
        subActivity: serviceLineForm.selectedSubActivity,
        quantity: serviceLineForm.quantity,
        note: serviceLineForm.note,
      };

      console.log("New Special Requirement:", newSpecialRequirement);

      // Build the request body based on selected location mode only
      requestBody = {};

      console.log("Current Order from Redux:", currentOrder?.orderDetails);
      console.log("Existing Order Pickup Info:", order.pickupInfo);
      console.log("Existing Order Delivery Info:", order.deliveryInfo);

      // Only include special requirements for the selected location mode
      if (serviceLineForm.locationMode === "pickup") {
        requestBody.pickupSpecialRequirements = {};

        // Get all pickup special requirements from Redux state
        if (currentOrder?.orderDetails?.pickupInfo) {
          currentOrder.orderDetails.pickupInfo.forEach((pickup: any) => {
            if (
              pickup.pickupLocation?._id &&
              pickup.pickupSpecialRequirements
            ) {
              requestBody.pickupSpecialRequirements[pickup.pickupLocation._id] =
                pickup.pickupSpecialRequirements.map((req: any) => ({
                  subActivity: req.subActivity?._id || req.subActivity,
                  quantity: req.quantity || 1,
                  note: req.note || "",
                }));
            }
          });
        } else {
          // Copy existing pickup special requirements from current order
          if (order.pickupInfo && order.pickupInfo.length > 0) {
            order.pickupInfo.forEach((pickup) => {
              if (
                pickup.pickupLocation?._id &&
                pickup.pickupSpecialRequirements
              ) {
                requestBody.pickupSpecialRequirements[
                  pickup.pickupLocation._id
                ] = pickup.pickupSpecialRequirements.map((req: any) => ({
                  subActivity: req.subActivity?._id || req.subActivity,
                  quantity: req.quantity || 1,
                  note: req.note || "",
                }));
              }
            });
          }
        }
      } else if (serviceLineForm.locationMode === "delivery") {
        requestBody.deliverySpecialRequirements = {};

        // Get all delivery special requirements from Redux state
        if (currentOrder?.orderDetails?.deliveryInfo) {
          currentOrder.orderDetails.deliveryInfo.forEach((delivery: any) => {
            if (
              delivery.deliveryLocation?._id &&
              delivery.deliverySpecialRequirements
            ) {
              requestBody.deliverySpecialRequirements[
                delivery.deliveryLocation._id
              ] = delivery.deliverySpecialRequirements.map((req: any) => ({
                subActivity: req.subActivity?._id || req.subActivity,
                quantity: req.quantity || 1,
                note: req.note || "",
              }));
            }
          });
        } else {
          // Copy existing delivery special requirements from current order
          if (order.deliveryInfo && order.deliveryInfo.length > 0) {
            order.deliveryInfo.forEach((delivery) => {
              if (
                delivery.deliveryLocation?._id &&
                delivery.deliverySpecialRequirements
              ) {
                requestBody.deliverySpecialRequirements[
                  delivery.deliveryLocation._id
                ] = delivery.deliverySpecialRequirements.map((req: any) => ({
                  subActivity: req.subActivity?._id || req.subActivity,
                  quantity: req.quantity || 1,
                  note: req.note || "",
                }));
              }
            });
          }
        }
      }

      // Add the new special requirement to the appropriate location
      if (serviceLineForm.locationMode === "pickup") {
        if (!requestBody.pickupSpecialRequirements[selectedLocationId]) {
          requestBody.pickupSpecialRequirements[selectedLocationId] = [];
        }
        requestBody.pickupSpecialRequirements[selectedLocationId].push(
          newSpecialRequirement
        );
      } else {
        if (!requestBody.deliverySpecialRequirements[selectedLocationId]) {
          requestBody.deliverySpecialRequirements[selectedLocationId] = [];
        }
        requestBody.deliverySpecialRequirements[selectedLocationId].push(
          newSpecialRequirement
        );
      }

      console.log("Final Request Body:", JSON.stringify(requestBody, null, 2));

      // Make the API call
      const response = await http.put(
        `/api/v1/orders/${order._id}/special-requirements`,
        requestBody
      );

      console.log("API Response:", response.data);

      if (response.data?.success) {
        // Refresh the order data to get the updated special requirements and pricing
        await getOrderById(order._id);

        toast({
          title: "Service Line Added",
          description: `Added ${serviceLineForm.serviceType} service: ${
            selectedSubActivityDetails.portalItemNameEn || "Unknown"
          } (${selectedSubActivityDetails.transactionType?.name}) for ${
            serviceLineForm.locationMode
          }`,
        });

        // Reset form and close popover
        setServiceLineForm({
          serviceType: "perItem",
          locationMode: "pickup",
          selectedLocation: "",
          selectedSubActivity: "",
          quantity: 1,
          note: "",
        });
        setAddServicePopoverOpen(false);
      } else {
        throw new Error(response.data?.message || "Failed to add service line");
      }
    } catch (error: any) {
      console.error("=== ERROR ADDING SERVICE LINE ===");
      console.error("Error details:", error);
      console.error("Form data at error:", serviceLineForm);
      console.error("Response data:", error.response?.data);
      console.error("Error message:", error.message);

      // Log the payload that was being sent (if it exists)
      try {
        if (requestBody && typeof requestBody === "object") {
          console.error(
            "Payload that was being sent:",
            JSON.stringify(requestBody, null, 2)
          );
        } else {
          console.error(
            "Payload was not constructed due to early validation error"
          );
        }
      } catch (logError) {
        console.error("Could not log payload due to error:", logError);
      }

      // Enhanced error handling with better backend message extraction
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.errors?.[0]?.msg ||
        error?.message ||
        "Failed to add service line";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("=== ADD SERVICE LINE SUBMISSION COMPLETED ===");
      setAddingServiceLine(false);
    }
  };

  // Get available locations based on selection
  const getAvailableLocations = () => {
    if (serviceLineForm.locationMode === "pickup") {
      return order.pickupInfo || [];
    } else {
      return order.deliveryInfo || [];
    }
  };

  // Handle cancel service line form
  const handleCancelServiceLine = () => {
    setServiceLineForm({
      serviceType: "perItem",
      locationMode: "pickup",
      selectedLocation: "",
      selectedSubActivity: "",
      quantity: 1,
      note: "",
    });
    setAddServicePopoverOpen(false);
    setAddingServiceLine(false);
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
      // Calculate totals from all service items
      let totalPrice = 0;
      let totalCost = 0;

      // Calculate from truck type matches
      if (order.truckTypeMatches) {
        order.truckTypeMatches.forEach((item, index) => {
          const serviceKey = generateServiceKey(
            "truck",
            index,
            item.subActivityId
          );
          const price = priceOverrides[serviceKey] ?? item.price ?? 0;
          const cost =
            costOverrides[serviceKey] ??
            selectedCosts[serviceKey] ??
            item.cost ??
            0;
          totalPrice += price;
          totalCost += cost;
        });
      }

      // Calculate from pickup special requirements
      if (order.specialRequirementsPrices?.pickupSpecialRequirements) {
        order.specialRequirementsPrices.pickupSpecialRequirements.forEach(
          (item, index) => {
            const serviceKey = generateServiceKey(
              "pickup",
              index,
              item.subActivityId
            );
            const price = priceOverrides[serviceKey] ?? item.basePrice ?? 0;
            const cost =
              costOverrides[serviceKey] ??
              selectedCosts[serviceKey] ??
              item.cost ??
              0;
            totalPrice += price;
            totalCost += cost;
          }
        );
      }

      // Calculate from delivery special requirements
      if (order.specialRequirementsPrices?.deliverySpecialRequirements) {
        order.specialRequirementsPrices.deliverySpecialRequirements.forEach(
          (item, index) => {
            const serviceKey = generateServiceKey(
              "delivery",
              index,
              item.subActivityId
            );
            const price = priceOverrides[serviceKey] ?? item.basePrice ?? 0;
            const cost =
              costOverrides[serviceKey] ??
              selectedCosts[serviceKey] ??
              item.cost ??
              0;
            totalPrice += price;
            totalCost += cost;
          }
        );
      }

      // Calculate profit margin
      const profitMargin =
        totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

      // Output in your desired format
      const orderFormat = {
        _id: order._id,
        service: order.service,
        typesOfGoods: order.typesOfGoods,
        goodsDescription: order.goodsDescription,
        billingAccount: order.billingAccount?._id || order.billingAccount,
        requesterName: order.requesterName,
        requesterMobile1: order.requesterMobile1,
        requesterMobile2: order.requesterMobile2,
        emailAddress: order.emailAddress,
        pickupInfo: order.pickupInfo,
        deliveryInfo: order.deliveryInfo,
        shippingDetails: order.shippingDetails,
        truckTypeMatches: order.truckTypeMatches,
        contactPerson: order.contactPerson,
        isDraft: false,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        __v: order.__v || 0,
        orderIndex: order.orderIndex,
        specialRequirementsPrices: order.specialRequirementsPrices,
        attachments: attachments.map((attachment, index) => ({
          index: index + 1,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          uploadedAt: attachment.uploadedAt,
        })),
        totalPrice: totalPrice,
        totalCost: totalCost,
        profitMargin: profitMargin,
      };

      // Submit IPO using Redux async thunk
      const result = await dispatch(
        actSubmitIPO({
          orderId: order._id,
          data: orderFormat,
        })
      );

      if (actSubmitIPO.fulfilled.match(result)) {
        const response = result.payload;
        console.groupCollapsed("IPO Submitted");
        console.log("Response:", response);
        console.groupEnd();

        toast({
          title: "IPO Submitted Successfully",
          description: "Initial Price Offer has been submitted successfully",
        });

        // Navigate to orders page
        navigate(`/orders`);

        // Reset actions after successful submission
        resetIpoActions();
      } else {
        // Handle error case
        toast({
          title: "Error",
          description: "Failed to submit IPO. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting IPO:", error);
      toast({
        title: "Error",
        description: "Failed to submit IPO",
        variant: "destructive",
      });
    }
  };

  // Fetch existing files for the order
  const fetchOrderFiles = async (orderId: string) => {
    setLoadingFiles(true);
    try {
      const response = await http.get(
        `/api/v1/uploads/orders/${orderId}/files`
      );

      // Handle the specific API response structure
      let files = [];
      if (
        response.data?.data?.files &&
        Array.isArray(response.data.data.files)
      ) {
        files = response.data.data.files;
      }

      if (files.length > 0) {
        const existingFiles = files.map((file: any, index: number) => {
          // Generate MIME type from file extension
          const getFileType = (fileName: string) => {
            const extension = fileName.split(".").pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
              pdf: "application/pdf",
              png: "image/png",
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              gif: "image/gif",
              doc: "application/msword",
              docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              xls: "application/vnd.ms-excel",
              xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              txt: "text/plain",
              csv: "text/csv",
            };
            return mimeTypes[extension || ""] || "application/octet-stream";
          };

          // Generate a clean display name from the fileName
          const getDisplayName = (fileName: string) => {
            // Remove timestamp prefix (e.g., "1753671141511_") if present
            const cleanName = fileName.replace(/^\d+_/, "");
            // Remove order ID suffix if present
            return cleanName.replace(/_[a-f0-9]{24}\./, ".");
          };

          return {
            id: `file-${index}-${Date.now()}`,
            name: getDisplayName(file.fileName),
            type: getFileType(file.fileName),
            size: file.fileSize,
            uploadedAt: file.uploadedAt,
            url: `/api/v1/${file.filePath}`, // Construct proper API URL for file access
            serverId: file.fileName, // Use fileName as server identifier
          };
        });

        setAttachments(existingFiles);
      } else {
        // If no files, ensure attachments is empty
        setAttachments([]);
      }
    } catch (error) {
      console.error("Error fetching order files:", error);
      // Don't show error toast for file fetching, as files might not exist
      // This is expected behavior for new orders
      setAttachments([]);
    } finally {
      setLoadingFiles(false);
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

      // Fetch existing files for this order
      fetchOrderFiles(id);
    }
  }, [location, getOrderById, toast]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any remaining blob URLs to prevent memory leaks
      attachments.forEach((attachment) => {
        if (attachment.url && attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.url);
        }
      });
    };
  }, []);

  // Fetch initial sub-activities when component mounts
  useEffect(() => {
    fetchSubActivities(serviceLineForm.serviceType);
  }, [fetchSubActivities, serviceLineForm.serviceType]);

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
      {/* Back Button and Order ID */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/orders")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <h2 className="text-3xl font-bold text-blue-600">
              {order.orderIndex || order._id}
            </h2>
          </div>
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
                <Button
                  size="sm"
                  className="bg-blue-600"
                  onClick={handleSubmitIPO}
                  disabled={ipoSubmissionLoading || order.isSubmitted}
                >
                  {ipoSubmissionLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit this IPO"
                  )}
                </Button>
                <Popover
                  open={addServicePopoverOpen}
                  onOpenChange={setAddServicePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button size="sm" className="bg-blue-600">
                      Add service line +
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Add Service Line
                        </h4>
                        <p className="text-xs text-gray-500">
                          Configure a new service line for this order
                        </p>
                      </div>

                      {/* Service Type Dropdown */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="serviceType"
                          className="text-xs font-medium"
                        >
                          Service Type
                        </Label>
                        <Select
                          value={serviceLineForm.serviceType}
                          onValueChange={(value) =>
                            handleServiceLineFormChange("serviceType", value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perItem">Per Item</SelectItem>
                            <SelectItem value="perLocation">
                              Per Location
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location Mode Radio Buttons */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">
                          Location Mode
                        </Label>
                        <RadioGroup
                          value={serviceLineForm.locationMode}
                          onValueChange={(value) =>
                            handleServiceLineFormChange("locationMode", value)
                          }
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="pickup"
                              id="pickup"
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor="pickup"
                              className="text-xs cursor-pointer"
                            >
                              Pick up
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="delivery"
                              id="delivery"
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor="delivery"
                              className="text-xs cursor-pointer"
                            >
                              Delivery
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Sub-Activity Selection Dropdown */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="subActivity"
                          className="text-xs font-medium"
                        >
                          Sub-Activity
                        </Label>
                        <Select
                          value={serviceLineForm.selectedSubActivity}
                          onValueChange={(value) =>
                            handleServiceLineFormChange(
                              "selectedSubActivity",
                              value
                            )
                          }
                          disabled={loadingSubActivities}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue
                              placeholder={
                                loadingSubActivities
                                  ? "Loading sub-activities..."
                                  : subActivities.length > 0
                                  ? "Select a sub-activity"
                                  : "No sub-activities available"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {!loadingSubActivities &&
                            subActivities.length > 0 ? (
                              subActivities.map((subActivity) => {
                                // Get finance effect color
                                const getFinanceEffectColor = (
                                  effect: string
                                ) => {
                                  switch (effect) {
                                    case "positive":
                                      return "text-green-600";
                                    case "negative":
                                      return "text-red-600";
                                    default:
                                      return "text-gray-600";
                                  }
                                };

                                const getFinanceEffectIcon = (
                                  effect: string
                                ) => {
                                  switch (effect) {
                                    case "positive":
                                      return "↗";
                                    case "negative":
                                      return "↙";
                                    default:
                                      return "—";
                                  }
                                };

                                return (
                                  <SelectItem
                                    key={subActivity._id}
                                    value={subActivity._id}
                                  >
                                    <div className="flex flex-col w-full">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                          {subActivity.portalItemNameEn}
                                        </span>
                                        <span
                                          className={`text-xs font-medium ${getFinanceEffectColor(
                                            subActivity.financeEffect
                                          )}`}
                                        >
                                          {getFinanceEffectIcon(
                                            subActivity.financeEffect
                                          )}{" "}
                                          {subActivity.financeEffect}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {subActivity.transactionType?.name} •{" "}
                                        {subActivity.activity?.activityNameEn}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })
                            ) : !loadingSubActivities &&
                              subActivities.length === 0 ? (
                              <div className="px-2 py-1.5 text-xs text-gray-500">
                                No sub-activities available
                              </div>
                            ) : (
                              <div className="px-2 py-1.5 text-xs text-gray-500">
                                Loading sub-activities...
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location Selection Dropdown */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-xs font-medium"
                        >
                          {serviceLineForm.locationMode === "pickup"
                            ? "Pickup Location"
                            : "Delivery Location"}
                        </Label>
                        <Select
                          value={serviceLineForm.selectedLocation}
                          onValueChange={(value) =>
                            handleServiceLineFormChange(
                              "selectedLocation",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue
                              placeholder={`Select ${serviceLineForm.locationMode} location`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableLocations().map((location, index) => {
                              const locationId =
                                serviceLineForm.locationMode === "pickup"
                                  ? (location as any).pickupLocation?._id
                                  : (location as any).deliveryLocation?._id;

                              const displayText =
                                serviceLineForm.locationMode === "pickup"
                                  ? `${formatLocation(
                                      (location as any).pickupLocation
                                    )} - ${
                                      (location as any).pickupDetailedAddress
                                    }`
                                  : `${formatLocation(
                                      (location as any).deliveryLocation
                                    )} - ${
                                      (location as any).deliveryDetailedAddress
                                    }`;

                              return (
                                <SelectItem
                                  key={index}
                                  value={locationId || `fallback-${index}`}
                                >
                                  {displayText}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="quantity"
                          className="text-xs font-medium"
                        >
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={serviceLineForm.quantity}
                          onChange={(e) =>
                            handleServiceLineFormChange(
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="h-8"
                          placeholder="Enter quantity"
                        />
                      </div>

                      {/* Note Field */}
                      <div className="space-y-2">
                        <Label htmlFor="note" className="text-xs font-medium">
                          Note (Optional)
                        </Label>
                        <Textarea
                          id="note"
                          value={serviceLineForm.note}
                          onChange={(e) =>
                            handleServiceLineFormChange("note", e.target.value)
                          }
                          className="h-16 resize-none"
                          placeholder="Enter optional note"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelServiceLine}
                          disabled={addingServiceLine}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddServiceLine}
                          disabled={
                            addingServiceLine ||
                            !serviceLineForm.selectedLocation ||
                            !serviceLineForm.selectedSubActivity ||
                            serviceLineForm.quantity < 1
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {addingServiceLine ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Adding...</span>
                            </div>
                          ) : (
                            "Add Service"
                          )}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button size="sm" className="bg-blue-600">
                  Download excel
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
                                          item.locationDetails
                                            ?.fromLocationDetails?._id,
                                        toLocation:
                                          item.locationDetails
                                            ?.toLocationDetails?._id,
                                      },
                                      item.pricingMethod
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
                              <span className="font-bold text-red-600 text-xs">
                                ${costOverrides[serviceKey] ?? selectedCost}
                              </span>
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

                      // Find the corresponding pickup location for this special requirement
                      const getPickupLocationForSpecialReq = () => {
                        // Try to find the pickup location that contains this special requirement
                        for (
                          let pickupIndex = 0;
                          pickupIndex < (order.pickupInfo || []).length;
                          pickupIndex++
                        ) {
                          const pickup = order.pickupInfo[pickupIndex];
                          const hasMatchingReq =
                            pickup.pickupSpecialRequirements?.some(
                              (req: any) =>
                                req.subActivity?._id === item.subActivityId ||
                                req.subActivity?.portalItemNameEn ===
                                  item.subActivityName
                            );
                          if (hasMatchingReq) {
                            return pickup.pickupLocation;
                          }
                        }
                        // Fallback to first pickup location if no specific match found
                        return order.pickupInfo?.[0]?.pickupLocation;
                      };

                      const pickupLocation = getPickupLocationForSpecialReq();
                      const locationText = pickupLocation
                        ? `${pickupLocation.country || "N/A"}, ${
                            pickupLocation.area || "N/A"
                          }`
                        : "Pickup Location";
                      const locationId = pickupLocation?._id;

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
                              <span
                                className="text-gray-700 text-xs leading-tight break-words"
                                title={locationText}
                              >
                                {locationText}
                              </span>
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
                                      item.subActivityId,
                                      {
                                        location: locationId,
                                      },
                                      item.pricingMethod
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
                              <span className="font-bold text-red-600 text-xs">
                                ${selectedCost}
                              </span>
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

                      // Find the corresponding delivery location for this special requirement
                      const getDeliveryLocationForSpecialReq = () => {
                        // Try to find the delivery location that contains this special requirement
                        for (
                          let deliveryIndex = 0;
                          deliveryIndex < (order.deliveryInfo || []).length;
                          deliveryIndex++
                        ) {
                          const delivery = order.deliveryInfo[deliveryIndex];
                          const hasMatchingReq =
                            delivery.deliverySpecialRequirements?.some(
                              (req: any) =>
                                req.subActivity?._id === item.subActivityId ||
                                req.subActivity?.portalItemNameEn ===
                                  item.subActivityName
                            );
                          if (hasMatchingReq) {
                            return delivery.deliveryLocation;
                          }
                        }
                        // Fallback to first delivery location if no specific match found
                        return order.deliveryInfo?.[0]?.deliveryLocation;
                      };

                      const deliveryLocation =
                        getDeliveryLocationForSpecialReq();
                      const locationText = deliveryLocation
                        ? `${deliveryLocation.country || "N/A"}, ${
                            deliveryLocation.area || "N/A"
                          }`
                        : "Delivery Location";
                      const locationId = deliveryLocation?._id;

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
                              <span
                                className="text-gray-700 text-xs leading-tight break-words"
                                title={locationText}
                              >
                                {locationText}
                              </span>
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
                                      item.subActivityId,
                                      {
                                        location: locationId,
                                      },
                                      item.pricingMethod
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
                              <span className="font-bold text-red-600 text-xs">
                                ${selectedCost}
                              </span>
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

        <AttachmentModule
          contextId={order._id}
          contextType="Order"
          title={order.orderIndex}
        />

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
    </div>
  );
}
