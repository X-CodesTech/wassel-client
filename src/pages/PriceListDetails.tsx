import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Edit,
  Trash,
  ArrowLeft,
  Loader2,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetPriceListById,
  actDeletePriceList,
  clearError,
  clearSelectedPriceList,
} from "@/store/priceLists";
import { useToast } from "@/hooks/use-toast";
import { SubActivityPrice } from "@/services/priceListServices";
import { PRICING_METHOD_OPTIONS } from "@/utils/constants";
import React from "react";
import DeletePriceListSubActivityDialog from "@/components/DeletePriceListSubActivityDialog";

export default function PriceListDetails() {
  const [match, params] = useRoute<{ id: string }>("/price-lists/:id");
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteSubActivityDialogOpen, setDeleteSubActivityDialogOpen] =
    useState(false);
  const [selectedSubActivityPrice, setSelectedSubActivityPrice] =
    useState<SubActivityPrice | null>(null);

  const {
    selectedPriceList: priceList,
    loading,
    error,
  } = useAppSelector((state) => state.priceLists);

  // Fetch price list data when component mounts
  useEffect(() => {
    if (match && params?.id) {
      dispatch(actGetPriceListById(params.id));
    }
  }, [match, params?.id, dispatch]);

  // Clear error and selected price list when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSelectedPriceList());
    };
  }, [dispatch]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleDelete = async () => {
    if (priceList?._id) {
      try {
        await dispatch(actDeletePriceList(priceList._id)).unwrap();
        setDeleteDialogOpen(false);
        toast({
          title: "Price List Deleted",
          description: `"${priceList.name}" has been deleted successfully.`,
        });
        setLocation("/price-lists");
      } catch (error) {
        console.error("Failed to delete price list:", error);
      }
    }
  };

  const handleEdit = () => {
    // For now, we'll just show a toast message
    // In the future, this could navigate to an edit page
    toast({
      title: "Edit Feature",
      description: "Edit functionality will be implemented soon.",
    });
  };

  const handleDeleteSubActivity = (subActivityPrice: SubActivityPrice) => {
    setSelectedSubActivityPrice(subActivityPrice);
    setDeleteSubActivityDialogOpen(true);
  };

  const handleBack = () => {
    setLocation("/price-lists");
  };

  // Get sub-activity name by ID
  const getSubActivityName = (subActivity: any) => {
    if (typeof subActivity === "string") {
      return "Unknown Activity";
    }
    return subActivity.portalItemNameEn || "Unknown Activity";
  };

  // Get activity name
  const getActivityName = (subActivity: any) => {
    if (typeof subActivity === "string") {
      return "Unknown Activity";
    }
    if (typeof subActivity.activity === "string") {
      return subActivity.activity;
    }
    return (
      subActivity.activity?.activityNameEn ||
      subActivity.activity?.activityNameAr ||
      subActivity.activity?._id ||
      "Unknown Activity"
    );
  };

  // Get transaction type
  const getTransactionType = (subActivity: any) => {
    if (typeof subActivity === "string") {
      return "Unknown";
    }
    if (typeof subActivity.transactionType === "string") {
      return subActivity.transactionType;
    }
    return (
      subActivity.transactionType?.name ||
      subActivity.transactionType?.nameEn ||
      subActivity.transactionType?.nameAr ||
      subActivity.transactionType?._id ||
      "Unknown"
    );
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "Import":
        return "bg-orange-100 text-orange-800";
      case "Export":
        return "bg-red-100 text-red-800";
      case "Domestic":
        return "bg-yellow-100 text-yellow-800";
      case "Cross-Border":
        return "bg-indigo-100 text-indigo-800";
      case "Transit":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPricingMethodColor = (method: string) => {
    switch (method) {
      case "perTrip":
        return "bg-blue-100 text-blue-800";
      case "perLocation":
        return "bg-green-100 text-green-800";
      case "perItem":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderPriceRange = (item: any) => {
    if (item.pricingMethod === "perItem" && item.basePrice) {
      return item.basePrice.toLocaleString();
    }
    if (item.price) {
      return item.price.toLocaleString();
    }
    if (item.locationPrices && item.locationPrices.length > 0) {
      const min = Math.min(...item.locationPrices.map((lp: any) => lp.price));
      const max = Math.max(...item.locationPrices.map((lp: any) => lp.price));
      return `${min.toLocaleString()}-${max.toLocaleString()}`;
    }
    return "N/A";
  };

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const renderExpandableContent = (item: any) => {
    if (!expandedRows.has(getSubActivityName(item.subActivity))) {
      return null;
    }

    const formatFromToAddress = (locationPrice: any) => {
      const formatFullAddress = (location: any, isArabic: boolean = false) => {
        if (!location) return isArabic ? "غير متوفر" : "N/A";

        if (isArabic) {
          return (
            `${location.villageAr || ""}, ${location.cityAr || ""}, ${
              location.areaAr || ""
            }, ${location.countryAr || ""}`
              .replace(/^,\s*/, "")
              .replace(/,\s*,/g, ",") || "غير متوفر"
          );
        }

        return (
          `${location.village || ""}, ${location.city || ""}, ${
            location.area || ""
          }, ${location.country || ""}`
            .replace(/^,\s*/, "")
            .replace(/,\s*,/g, ",") || "N/A"
        );
      };

      // For perLocation, show the main location
      if (locationPrice.pricingMethod === "perLocation") {
        const locationAddress = formatFullAddress(locationPrice.location);
        const locationAddressAr = formatFullAddress(
          locationPrice.location,
          true
        );

        return {
          english: `Location: ${locationAddress}`,
          arabic: `الموقع: ${locationAddressAr}`,
        };
      }

      // For other pricing methods, show from/to locations
      const fromAddress = formatFullAddress(locationPrice.fromLocation);
      const toAddress = formatFullAddress(locationPrice.toLocation);
      const fromAddressAr = formatFullAddress(locationPrice.fromLocation, true);
      const toAddressAr = formatFullAddress(locationPrice.toLocation, true);

      return {
        english: `From: ${fromAddress} → To: ${toAddress}`,
        arabic: `من: ${fromAddressAr} → إلى: ${toAddressAr}`,
      };
    };

    return (
      <tr className="bg-gray-50">
        <td colSpan={7} className="p-4">
          <div className="space-y-4">
            {item.locationPrices && item.locationPrices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-center p-2">Activity Name</th>
                      <th className="text-center p-2">Address</th>
                      <th className="text-center p-2">Price</th>
                      <th className="text-center p-2">Pricing Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.locationPrices.map(
                      (locationPrice: any, index: number) => {
                        const addressInfo = formatFromToAddress(locationPrice);

                        return (
                          <tr key={index}>
                            <td className="text-start p-2">
                              <div className="text-xs space-y-1">
                                <div>{getActivityName(item.subActivity)}</div>
                                <div>
                                  {typeof item.subActivity.activity === "string"
                                    ? ""
                                    : item.subActivity.activity?.nameAr || ""}
                                </div>
                              </div>
                            </td>
                            <td className="text-start p-2">
                              <div className="text-xs space-y-1">
                                <div>{addressInfo.english}</div>
                                <div>{addressInfo.arabic}</div>
                              </div>
                            </td>
                            <td className="text-center font-medium p-2">
                              {locationPrice.price?.toLocaleString() || "N/A"}
                            </td>
                            <td className="text-center p-2">
                              <Badge
                                className={getPricingMethodColor(
                                  locationPrice.pricingMethod
                                )}
                              >
                                {
                                  PRICING_METHOD_OPTIONS[
                                    locationPrice.pricingMethod as keyof typeof PRICING_METHOD_OPTIONS
                                  ]
                                }
                              </Badge>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No location details available
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTableRow = (item: any, index: number) => {
    const isExpandable = ["perLocation", "perTrip"].includes(
      item.pricingMethod
    );
    const isExpanded = expandedRows.has(getSubActivityName(item.subActivity));

    return (
      <React.Fragment key={index}>
        <tr className="hover:bg-gray-50">
          <td className="text-center p-2">
            {isExpandable && (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  toggleExpanded(getSubActivityName(item.subActivity))
                }
                className="h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-3 h-3" />
                ) : (
                  <ChevronDownIcon className="w-3 h-3" />
                )}
              </Button>
            )}
          </td>
          <td className="font-medium text-center p-2">
            {getSubActivityName(item.subActivity)}
          </td>
          <td className="font-medium text-center p-2">
            {getActivityName(item.subActivity)}
          </td>
          <td className="font-medium text-center p-2">
            <Badge
              className={getTransactionTypeColor(
                getTransactionType(item.subActivity)
              )}
            >
              {getTransactionType(item.subActivity)}
            </Badge>
          </td>
          <td className="font-medium text-center p-2">
            <Badge className={getPricingMethodColor(item.pricingMethod)}>
              {
                PRICING_METHOD_OPTIONS[
                  item.pricingMethod as keyof typeof PRICING_METHOD_OPTIONS
                ]
              }
            </Badge>
          </td>
          <td className="font-medium text-center p-2">
            {renderPriceRange(item)}
          </td>
          <td className="font-medium text-center p-2">
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                className="text-blue-500"
                onClick={handleEdit}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDeleteSubActivity(item)}
              >
                <Trash className="w-3 h-3" />
              </Button>
            </div>
          </td>
        </tr>
        {isExpandable && renderExpandableContent(item)}
      </React.Fragment>
    );
  };

  if (loading && !priceList) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading price list details...</span>
        </div>
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Price List Not Found</h3>
          <p className="text-gray-500 mb-4">
            The price list you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Price Lists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <title>Price List Details | Wassel</title>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="p-1 mr-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {priceList.name}
          </h2>
          <p className="text-gray-500 mt-1">{priceList.description}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Price List Details</h3>
            <p className="text-sm text-gray-500">
              Effective from{" "}
              {new Date(priceList.effectiveFrom).toLocaleDateString()} to{" "}
              {new Date(priceList.effectiveTo).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items in this Price List</CardTitle>
          <CardDescription>
            These are the items and their prices included in this price list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {priceList.subActivityPrices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium mb-1">No Items</h4>
              <p className="text-gray-500 max-w-md">
                This price list doesn't have any items yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-center w-12 p-2" />
                    <th className="text-center p-2">Service</th>
                    <th className="text-center p-2">Activity</th>
                    <th className="text-center p-2">Transaction Type</th>
                    <th className="text-center p-2">Pricing Method</th>
                    <th className="text-center p-2">Price Range</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.subActivityPrices.map((item, index) =>
                    renderTableRow(item, index)
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the price list "{priceList.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sub-Activity Dialog */}
      {selectedSubActivityPrice && (
        <DeletePriceListSubActivityDialog
          open={deleteSubActivityDialogOpen}
          onOpenChange={setDeleteSubActivityDialogOpen}
          selectedSubActivityPrice={selectedSubActivityPrice}
          priceListId={priceList._id || ""}
        />
      )}
    </div>
  );
}
