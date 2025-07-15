import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Vendor } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useVendors } from "@/hooks/useVendors";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetVendorPriceLists,
  actCreateVendorPriceList,
  actUpdateVendorPriceList,
  actDeleteVendorPriceList,
  clearPriceLists,
} from "@/store/vendors";
import VendorPriceListModal from "@/components/VendorPriceListModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Star,
  Package,
  TrendingUp,
  Edit,
  FileText,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
  VendorPriceList,
} from "@/services/vendorServices";
import { PriceList } from "@/services/priceListServices";

interface VendorDetailsProps {
  params?: {
    id: string;
  };
}

export default function VendorDetails({ params }: VendorDetailsProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { records, loading, getVendors } = useVendors();
  const dispatch = useAppDispatch();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] =
    useState<VendorPriceList | null>(null);

  // Get vendor price lists state from Redux
  const {
    priceLists,
    getPriceListsLoading,
    getPriceListsError,
    createPriceListLoading,
    updatePriceListLoading,
    deletePriceListLoading,
  } = useAppSelector((state) => state.vendors);

  useEffect(() => {
    // Fetch all vendors if not already loaded
    if (records.length === 0) {
      getVendors();
    }
  }, [getVendors, records.length]);

  useEffect(() => {
    // Find the specific vendor by vendAccount
    if (params?.id && records.length > 0) {
      const foundVendor = records.find((v) => v.vendAccount === params.id);
      if (foundVendor) {
        setVendor(foundVendor);
        // Fetch vendor price lists
        dispatch(actGetVendorPriceLists(foundVendor._id));
      } else {
        toast({
          title: "Vendor not found",
          description: `Vendor with account ${params.id} was not found.`,
          variant: "destructive",
        });
        navigate("/vendors");
      }
    }
  }, [params?.id, records, toast, navigate, dispatch]);

  // Cleanup price lists when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPriceLists());
    };
  }, [dispatch]);

  // Show error toast if price lists fetch fails
  useEffect(() => {
    if (getPriceListsError) {
      toast({
        title: "Error loading price lists",
        description: getPriceListsError,
        variant: "destructive",
      });
    }
  }, [getPriceListsError, toast]);

  // CRUD Operation Handlers
  const handleCreatePriceList = async (data: CreateVendorPriceListRequest) => {
    try {
      const result = await dispatch(actCreateVendorPriceList(data));
      if (actCreateVendorPriceList.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Price list created successfully",
        });
        // Refresh the price lists
        if (vendor) {
          dispatch(actGetVendorPriceLists(vendor._id));
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create price list",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePriceList = async (
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest
  ) => {
    try {
      const result = await dispatch(
        actUpdateVendorPriceList(data as UpdateVendorPriceListRequest)
      );
      if (actUpdateVendorPriceList.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Price list updated successfully",
        });
        // Refresh the price lists
        if (vendor) {
          dispatch(actGetVendorPriceLists(vendor._id));
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update price list",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeletePriceList = async () => {
    if (!selectedPriceList) return;

    try {
      const result = await dispatch(
        actDeleteVendorPriceList(selectedPriceList._id)
      );
      if (actDeleteVendorPriceList.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Price list deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedPriceList(null);
        // Refresh the price lists
        if (vendor) {
          dispatch(actGetVendorPriceLists(vendor._id));
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete price list",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Modal handlers
  const handleAddPriceList = () => {
    setIsAddModalOpen(true);
  };

  const handleEditPriceList = (priceList: VendorPriceList) => {
    setSelectedPriceList(priceList);
    setIsEditModalOpen(true);
  };

  const handleDeletePriceListClick = (priceList: VendorPriceList) => {
    setSelectedPriceList(priceList);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (blocked: boolean) => {
    return blocked ? (
      <Badge variant="destructive">Blocked</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      completed: "outline",
      "in-progress": "secondary",
      pending: "default",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading === "pending") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Vendor not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/vendors")}
            className="mt-4"
          >
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <title>Vendor Details | Wassel</title>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/vendors")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {vendor.vendName}
            </h1>
            <p className="text-muted-foreground">
              Vendor Details & Performance
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendor Account
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.vendAccount}</div>
            <p className="text-xs text-muted-foreground">Account ID</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusBadge(vendor.blocked)}
            </div>
            <p className="text-xs text-muted-foreground">
              {vendor.blocked ? "Blocked" : "Active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(vendor.createdDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Registration date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(vendor.updatedAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Last modification</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Information Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Vendor Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor Name:
                </span>
                <span className="text-sm font-semibold">{vendor.vendName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor Account:
                </span>
                <span className="text-sm">{vendor.vendAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor Group ID:
                </span>
                <span className="text-sm">{vendor.vendGroupId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Status:
                </span>
                <span className="text-sm">
                  {vendor.blocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Created Date:
                </span>
                <span className="text-sm">
                  {new Date(vendor.createdDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Last Updated:
                </span>
                <span className="text-sm">
                  {new Date(vendor.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor ID:
                </span>
                <span className="text-sm">{vendor._id}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost List Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cost list</CardTitle>
          <Button size="sm" variant="outline" onClick={handleAddPriceList}>
            <Plus className="h-4 w-4 mr-2" />
            Add Price List
          </Button>
        </CardHeader>
        <CardContent>
          {getPriceListsLoading === "pending" ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading price lists...</p>
              </div>
            </div>
          ) : priceLists && priceLists.length > 0 ? (
            <div className="space-y-4">
              {priceLists.map((priceList) => (
                <div key={priceList._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {priceList.name || priceList.nameAr}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {priceList.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge
                          variant={priceList.isActive ? "default" : "secondary"}
                        >
                          {priceList.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            priceList.effectiveFrom
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(priceList.effectiveTo).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPriceList(priceList)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePriceListClick(priceList)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {priceList.subActivityPrices &&
                    priceList.subActivityPrices.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sub Activity</TableHead>
                            <TableHead>Pricing Method</TableHead>
                            <TableHead>Base Cost</TableHead>
                            <TableHead>Location Prices</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {priceList.subActivityPrices.map(
                            (subActivity, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {subActivity._id}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {subActivity.pricingMethod}
                                  </Badge>
                                </TableCell>
                                <TableCell>${subActivity.cost}</TableCell>
                                <TableCell>
                                  {subActivity.locationPrices &&
                                  subActivity.locationPrices.length > 0 ? (
                                    <div className="space-y-1">
                                      {subActivity.locationPrices.map(
                                        (locationPrice, locationIndex) => (
                                          <div
                                            key={locationIndex}
                                            className="text-xs"
                                          >
                                            {locationPrice.toLocation?.country}
                                            <span className="font-medium">
                                              {
                                                locationPrice.fromLocation
                                                  ?.country
                                              }{" "}
                                              →{" "}
                                              {
                                                locationPrice.toLocation
                                                  ?.country
                                              }
                                              :
                                            </span>{" "}
                                            ${locationPrice.cost}
                                          </div>
                                        )
                                      )}
                                      {subActivity.locationPrices.map(
                                        (locationPrice, locationIndex) => (
                                          <div
                                            key={locationIndex}
                                            className="text-xs"
                                          >
                                            {
                                              locationPrice.toLocation
                                                ?.countryAr
                                            }
                                            <span className="font-medium">
                                              {
                                                locationPrice.fromLocation
                                                  ?.countryAr
                                              }{" "}
                                              →{" "}
                                              {
                                                locationPrice.toLocation
                                                  ?.countryAr
                                              }
                                              :
                                            </span>{" "}
                                            ${locationPrice.cost}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-sm">
                                      No location prices
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No price lists found
              </h3>
              <p className="text-gray-500 mb-4">
                This vendor doesn't have any price lists configured yet.
              </p>
              <Button size="sm" variant="outline" onClick={handleAddPriceList}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Price List
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Requests */}
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pink-600">
            Payment requests per vendor
          </CardTitle>
          <p className="text-sm text-gray-600">
            View and send shipment number and confirmation date and amount and
            currency with ability to confirm, update, and print list of PR, and
            generate a payment request to be sent to the vendor
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment voucher</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-800 text-white">
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Ref number</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Currency</TableHead>
                  <TableHead className="text-white">Payment date</TableHead>
                  <TableHead className="text-white">Confirmate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card> */}

      {/* Sub vendor - Commented out for future use */}
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pink-600">Sub vendor</CardTitle>
          <p className="text-sm text-gray-600">
            Define drivers, trucks, and the default one
          </p>
        </CardHeader>
        <CardContent className="min-h-[100px] border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No sub vendors defined</p>
        </CardContent>
      </Card> */}

      {/* Modals */}
      <VendorPriceListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        vendorId={vendor?._id || ""}
        onSubmit={handleCreatePriceList}
        isLoading={createPriceListLoading === "pending"}
      />

      <VendorPriceListModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPriceList(null);
        }}
        vendorId={vendor?._id || ""}
        initialData={selectedPriceList || undefined}
        onSubmit={handleUpdatePriceList}
        isLoading={updatePriceListLoading === "pending"}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPriceList(null);
        }}
        onConfirm={handleDeletePriceList}
        title="Delete Price List"
        description={`Are you sure you want to delete "${selectedPriceList?.name}"? This action cannot be undone.`}
        isLoading={deletePriceListLoading === "pending"}
      />
    </div>
  );
}
