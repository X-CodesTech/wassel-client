import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VendorCostListTable from "@/components/VendorCostListTable";
import VendorDetailsEmptyState from "@/components/VendorDetailsEmptyState";
import VendorInfoTable from "@/components/VendorInfoTable";
import CreatePriceListDialog from "@/components/vendorPriceList/CreatePriceListDialog";
import VendorPriceListActions from "@/components/VendorPriceListActions";
import VendorPriceListModal from "@/components/VendorPriceListModal";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { useVendors } from "@/hooks/useVendors";
import {
  CreateVendorPriceListRequest,
  VendorPriceList,
} from "@/services/vendorServices";
import {
  actAddVendorSubActivityPrice,
  actGetVendorPriceLists,
  clearPriceLists,
} from "@/store/vendors";
import { Vendor } from "@/types/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Package,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface VendorDetailsProps {
  params?: {
    id: string;
  };
}

export type TVendorDialogType =
  | "createPriceList"
  | "addSubActivityPrice"
  | "deletePriceList"
  | "deleteSubActivityPrice"
  | null;

export default function VendorDetails({ params }: VendorDetailsProps) {
  const { toast } = useToast();

  const [_, navigate] = useLocation();

  const { records, loading, getVendors } = useVendors();

  const [selectedPriceList, setSelectedPriceList] =
    useState<VendorPriceList | null>(null);
  const [selectedPriceListId, setSelectedPriceListId] = useState<string | null>(
    null
  );
  const [dialogType, setDialogType] = useState<TVendorDialogType>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const dispatch = useAppDispatch();
  const {
    priceLists,
    getPriceListsLoading,
    getPriceListsError,
    createPriceListLoading,
  } = useAppSelector((state) => state.vendors);

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

  const handleOpenDialog = (type: TVendorDialogType, priceListId?: string) => {
    setDialogType(type);
    setSelectedPriceListId(priceListId || null);
  };

  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedPriceListId(null);
    setSelectedPriceList(null);
  };

  const isDialogOpen = (type: TVendorDialogType) => {
    return dialogType === type;
  };

  // CRUD Operation Handlers
  const handleAddSubActivityPrice = (data: CreateVendorPriceListRequest) => {
    // Extract subActivityPrice from either old or new form structure
    const subActivityPrice =
      data.subActivityPrices && data.subActivityPrices.length > 0
        ? data.subActivityPrices[0] // Old structure with array
        : ({
            // New simplified structure
            subActivity: (data as any).subActivity || "",
            pricingMethod: (data as any).pricingMethod || "perItem",
            cost: (data as any).cost || 0,
            locationPrices: (data as any).locationPrices || [],
            tripLocationPrices: (data as any).tripLocationPrices || [],
          } as any);

    // Build request data based on pricing method
    const baseRequest = {
      pricingMethod: subActivityPrice.pricingMethod,
      cost: subActivityPrice.cost || 0,
    };

    let requestData;
    switch (subActivityPrice.pricingMethod) {
      case "perLocation":
        requestData = {
          ...baseRequest,
          locationPrices: (subActivityPrice.locationPrices || [{}]).map(
            (lp: any) => ({
              location: lp.location,
              pricingMethod: "perLocation" as const,
              cost: lp.cost,
            })
          ),
        };
        break;

      case "perTrip":
        requestData = {
          ...baseRequest,
          locationPrices: (subActivityPrice.tripLocationPrices || []).map(
            (lp: any) => ({
              fromLocation: lp.fromLocation,
              toLocation: lp.toLocation,
              pricingMethod: "perTrip" as const,
              cost: lp.cost,
            })
          ),
        };
        break;

      default:
        requestData = baseRequest;
    }

    dispatch(
      actAddVendorSubActivityPrice({
        ...requestData,
        vendorPriceListId: selectedPriceListId!,
      })
    )
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Price list created successfully",
        });
        dispatch(actGetVendorPriceLists(vendor?._id || ""));
      })
      .catch((error) => {
        const errorMessage = error.message || "An unexpected error occurred";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      });
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
      <VendorInfoTable vendor={vendor} vendorDetails={priceLists?.[0]} />

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
              <div className="flex items-center gap-4">
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPriceList(item);
                    handleOpenDialog("deletePriceList", item._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <VendorCostListTable priceList={item} />
            </CardContent>
          </Card>
        ))
      ) : (
        <VendorDetailsEmptyState
          vendorDetails={vendor}
          handleOpenDialog={handleOpenDialog}
        />
      )}

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

      <DeleteConfirmationDialog
        open={isDialogOpen("deletePriceList")}
        onOpenChange={handleCloseDialog}
        selectedPriceList={selectedPriceList!}
        vendorId={vendor?._id || ""}
      />
    </div>
  );
}
