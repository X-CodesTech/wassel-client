import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VendorCostListTable from "@/components/VendorCostListTable";
import VendorInfoTable from "@/components/VendorInfoTable";
import CreatePriceListDialog from "@/components/vendorPriceList/CreatePriceListDialog";
import VendorPriceListActions from "@/components/VendorPriceListActions";
import VendorPriceListModal from "@/components/VendorPriceListModal";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { useVendors } from "@/hooks/useVendors";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
  VendorPriceList,
} from "@/services/vendorServices";
import {
  actAddVendorSubActivityPrice,
  actDeleteVendorPriceList,
  actGetVendorPriceLists,
  actUpdateVendorPriceList,
  clearPriceLists,
} from "@/store/vendors";
import { Vendor } from "@/types/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface VendorDetailsProps {
  params?: {
    id: string;
  };
}

export default function VendorDetails({ params }: VendorDetailsProps) {
  const [selectedPriceListId, setSelectedPriceListId] = useState<string | null>(
    null
  );
  const [dialogType, setDialogType] = useState<
    | "createPriceList"
    | "addSubActivityPrice"
    | "editSubActivityPrice"
    | "deleteSubActivityPrice"
    | null
  >(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { records, loading, getVendors } = useVendors();
  const dispatch = useAppDispatch();

  // Modal states
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

  const vendorDetails = priceLists?.[0];
  const loopItems = priceLists?.map((item) => item);

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
        setVendor({
          ...foundVendor,
          updatedAt: foundVendor.updatedAt ?? foundVendor.createdDate,
        });
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

  const handleOpenDialog = (type: typeof dialogType, priceListId?: string) => {
    setDialogType(type);
    setSelectedPriceListId(priceListId || null);
    setSelectedPriceList(null);
  };

  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedPriceListId(null);
    setSelectedPriceList(null);
  };

  const isDialogOpen = (type: typeof dialogType) => {
    return dialogType === type;
  };

  // CRUD Operation Handlers
  const handleAddSubActivityPrice = async (
    data: CreateVendorPriceListRequest
  ) => {
    try {
      // Handle both old and new form structures
      let subActivityPrice;
      if (data.subActivityPrices && data.subActivityPrices.length > 0) {
        // Old structure with array
        subActivityPrice = data.subActivityPrices[0];
      } else {
        // New simplified structure - create a mock subActivityPrice from the form data
        subActivityPrice = {
          subActivity: (data as any).subActivity || "",
          pricingMethod: (data as any).pricingMethod || "perItem",
          cost: (data as any).cost || 0,
          locationPrices: (data as any).locationPrices || [],
          tripLocationPrices: (data as any).tripLocationPrices || [],
        } as any;
      }

      const subActivityId =
        typeof subActivityPrice.subActivity === "string"
          ? subActivityPrice.subActivity
          : subActivityPrice.subActivity._id;

      // Always include the id field and structure the request properly
      let requestData: any = {
        subActivity: subActivityId,
        pricingMethod: subActivityPrice.pricingMethod,
      };

      // For perLocation, always include locationPrices array (even if empty)
      if (subActivityPrice.pricingMethod === "perLocation") {
        requestData.locationPrices = (
          subActivityPrice.locationPrices || [{}]
        ).map((lp: any) => ({
          location: lp.location,
          pricingMethod: "perLocation" as const,
          cost: lp.cost,
        }));
      } else if (subActivityPrice.pricingMethod === "perTrip") {
        // For perTrip, include tripLocationPrices array
        requestData.locationPrices = (
          subActivityPrice.tripLocationPrices || []
        ).map((lp: any) => ({
          fromLocation: lp.fromLocation,
          toLocation: lp.toLocation,
          pricingMethod: "perTrip" as const,
          cost: lp.cost,
        }));
      } else {
        // For other pricing methods, include cost field
        requestData.cost = subActivityPrice.cost || 0;
      }

      const result = await dispatch(
        actAddVendorSubActivityPrice({
          ...requestData,
          vendorPriceListId: selectedPriceListId!,
        })
      );
      if (actAddVendorSubActivityPrice.fulfilled.match(result)) {
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
      // Handle both old and new form structures
      let subActivityPrice;
      if (
        "subActivityPrices" in data &&
        data.subActivityPrices &&
        data.subActivityPrices.length > 0
      ) {
        // Old structure with array
        subActivityPrice = data.subActivityPrices[0];
      } else {
        // New simplified structure - create a mock subActivityPrice from the form data
        subActivityPrice = {
          subActivity: (data as any).subActivity || "",
          pricingMethod: (data as any).pricingMethod || "perItem",
          cost: (data as any).cost || 0,
          locationPrices: (data as any).locationPrices || [],
          tripLocationPrices: (data as any).tripLocationPrices || [],
        } as any;
      }

      // Ensure locationPrices have the correct structure for perLocation
      if (subActivityPrice.pricingMethod === "perLocation") {
        subActivityPrice.locationPrices = (
          subActivityPrice.locationPrices || []
        ).map((lp: any) => ({
          location: lp.location,
          pricingMethod: "perLocation" as const,
          cost: lp.cost,
        }));
      } else if (subActivityPrice.pricingMethod === "perTrip") {
        // Ensure tripLocationPrices have the correct structure for perTrip
        subActivityPrice.tripLocationPrices = (
          subActivityPrice.tripLocationPrices || []
        ).map((lp: any) => ({
          fromLocation: lp.fromLocation,
          toLocation: lp.toLocation,
          pricingMethod: "perTrip" as const,
          cost: lp.cost,
        }));
      }

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
        handleCloseDialog();
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
              {vendor.blocked ? (
                <Badge variant="destructive">Blocked</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              )}
            </div>
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
      <VendorInfoTable vendor={vendor} vendorDetails={vendorDetails} />

      <div className="w-full flex justify-end">
        <VendorPriceListActions
          vendorId={vendor._id}
          vendorName={vendor.vendName}
          priceListId={selectedPriceListId!}
        />
      </div>

      {/* Cost List Section */}

      {getPriceListsLoading === "pending" ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading price lists...</p>
          </div>
        </div>
      ) : loopItems?.length ? (
        loopItems?.map((item) => (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{item.name}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleOpenDialog("addSubActivityPrice", item._id)
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              <VendorCostListTable priceList={item} />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="mb-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No price lists found
            </h3>
            <p className="text-gray-500 mb-4">
              This vendor doesn't have any price lists configured yet.
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={!!vendorDetails?._id}
              onClick={() => handleOpenDialog("createPriceList")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Price List
            </Button>
          </div>
        </Card>
      )}

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
        isOpen={isDialogOpen("addSubActivityPrice")}
        onClose={handleCloseDialog}
        vendorId={vendor?._id || ""}
        onSubmit={handleAddSubActivityPrice}
        isLoading={createPriceListLoading === "pending"}
      />

      <CreatePriceListDialog
        open={isDialogOpen("createPriceList")}
        onOpenChange={handleCloseDialog}
        vendorId={vendor?._id || ""}
      />

      <VendorPriceListModal
        isOpen={isDialogOpen("editSubActivityPrice")}
        onClose={handleCloseDialog}
        vendorId={vendor?._id || ""}
        initialData={
          selectedPriceList
            ? {
                _id: selectedPriceList._id,
                vendorId: vendor?._id || "",
                name: selectedPriceList.name,
                nameAr: selectedPriceList.nameAr,
                description: selectedPriceList.description,
                descriptionAr: selectedPriceList.descriptionAr,
                effectiveFrom: selectedPriceList.effectiveFrom.toISOString(),
                effectiveTo: selectedPriceList.effectiveTo.toISOString(),
                isActive: selectedPriceList.isActive,
                subActivityPrices: selectedPriceList.subActivityPrices,
              }
            : undefined
        }
        onSubmit={handleUpdatePriceList}
        isLoading={updatePriceListLoading === "pending"}
      />

      <DeleteConfirmationDialog
        isOpen={isDialogOpen("deleteSubActivityPrice")}
        onClose={handleCloseDialog}
        onConfirm={handleDeletePriceList}
        title="Delete Price List"
        description={`Are you sure you want to delete "${selectedPriceList?.name}"? This action cannot be undone.`}
        isLoading={deletePriceListLoading === "pending"}
      />
    </div>
  );
}
