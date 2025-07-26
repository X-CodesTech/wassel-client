import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Plus, Edit, Trash, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { actGetPriceLists, clearError } from "@/store/priceLists";
import { useLocation } from "wouter";
import { PriceList, PricingMethod } from "@/services/priceListServices";
import { SubActivity } from "@/types/types";
import EditPriceListDialog from "@/components/PriceList/EditPriceListDialog";
import DeletePriceListDialog from "@/components/PriceList/DeletePriceListDialog";
import AddPriceListDialog from "@/components/PriceList/AddPriceListDialog";

export type TPriceListModalType =
  | "AddPriceList"
  | "EditPriceList"
  | "DeletePriceList";

export default function PriceLists() {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const {
    records: priceLists,
    loading,
    error,
  } = useAppSelector((state) => state.priceLists);
  const { toast } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(
    null
  );
  const [deletingPriceList, setDeletingPriceList] = useState<PriceList | null>(
    null
  );

  // Sub-activities state
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [selectedSubActivities, setSelectedSubActivities] = useState<
    {
      id: string;
      name: string;
      price: string;
      cost: string;
      selected: boolean;
      pricingMethod: PricingMethod;
    }[]
  >([]);

  // Fetch price lists on component mount
  useEffect(() => {
    dispatch(actGetPriceLists());
  }, [dispatch]);

  // Extract sub-activities from price lists response
  useEffect(() => {
    if (priceLists.length > 0) {
      const allSubActivities = new Map<string, SubActivity>();

      priceLists.forEach((priceList) => {
        if (
          priceList.subActivityPrices &&
          Array.isArray(priceList.subActivityPrices)
        ) {
          priceList.subActivityPrices.forEach((subActivityPrice) => {
            const subActivityId =
              typeof subActivityPrice.subActivity === "string"
                ? subActivityPrice.subActivity
                : subActivityPrice.subActivity._id;

            if (typeof subActivityPrice.subActivity !== "string") {
              // Create a SubActivity object from the embedded sub-activity data
              const embeddedSubActivity =
                subActivityPrice.subActivity as unknown as SubActivity;
              allSubActivities.set(subActivityId, {
                _id: embeddedSubActivity._id,
                activity:
                  typeof embeddedSubActivity.activity === "string"
                    ? embeddedSubActivity.activity
                    : embeddedSubActivity.activity?._id!,
                transactionType: embeddedSubActivity.transactionType,
                financeEffect: embeddedSubActivity.financeEffect as
                  | "none"
                  | "positive"
                  | "negative",
                pricingMethod: embeddedSubActivity.pricingMethod as
                  | "perItem"
                  | "perLocation"
                  | "perTrip",
                portalItemNameEn: embeddedSubActivity.portalItemNameEn,
                portalItemNameAr: embeddedSubActivity.portalItemNameAr,
                isUsedByFinance: embeddedSubActivity.isUsedByFinance,
                isUsedByOps: embeddedSubActivity.isUsedByOps,
                isInShippingUnit: embeddedSubActivity.isInShippingUnit,
                isActive: embeddedSubActivity.isActive,
                isInSpecialRequirement:
                  embeddedSubActivity.isInSpecialRequirement,
              });
            }
          });
        }
      });

      setSubActivities(Array.from(allSubActivities.values()));
    }
  }, [priceLists]);

  // Initialize selected sub-activities when sub-activities data loads
  useEffect(() => {
    if (subActivities && subActivities.length > 0) {
      const subActivityOptions = subActivities.map((item) => ({
        id: item._id!,
        name: item.portalItemNameEn,
        price: "0.00",
        cost: "0.00",
        selected: false,
        pricingMethod: "perItem" as PricingMethod,
      }));
      setSelectedSubActivities(subActivityOptions);
    }
  }, [subActivities]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: typeof error === "string" ? error : JSON.stringify(error),
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Handle checkbox change for sub-activities
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedSubActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: checked } : item
      )
    );
  };

  // Handle price change for sub-activities
  const handlePriceChange = (id: string, price: string) => {
    setSelectedSubActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price } : item))
    );
  };

  // Handle cost change for sub-activities
  const handleCostChange = (id: string, cost: string) => {
    setSelectedSubActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cost } : item))
    );
  };

  // Handle pricing method change for sub-activities
  const handlePricingMethodChange = (
    id: string,
    pricingMethod: PricingMethod
  ) => {
    setSelectedSubActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pricingMethod } : item))
    );
  };

  // Open edit modal
  const openEditModal = (priceList: PriceList) => {
    setEditingPriceList(priceList);
    setEditModalOpen(true);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (priceList: PriceList) => {
    setDeletingPriceList(priceList);
    setDeleteConfirmOpen(true);
  };

  // Handle card click to navigate to details
  const handleCardClick = (priceList: PriceList) => {
    setLocation(`/price-lists/${priceList._id}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get sub-activity name by ID
  const getSubActivityName = (subActivityId: string) => {
    const subActivity = subActivities.find((sa) => sa._id === subActivityId);
    return subActivity?.portalItemNameEn || "Unknown Activity";
  };

  const onOpenChange = (open: boolean, modalType?: TPriceListModalType) => {
    setModalOpen(open);
    setEditModalOpen(open);
    setDeleteConfirmOpen(open);
    setEditingPriceList(null);
    setDeletingPriceList(null);
    if (modalType === "AddPriceList") {
      setSelectedSubActivities((prev) =>
        prev.map((item) => ({
          ...item,
          selected: false,
          price: "0.00",
          cost: "0.00",
        }))
      );
    }
  };

  if (loading && priceLists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading price lists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Price Lists Management
        </h2>
        <p className="text-gray-500 mt-2">
          Create and manage pricing configurations for your services and
          activities
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Your Price Lists</h3>
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2"
          style={{
            backgroundColor: "#1e88e5",
            color: "white",
            border: "none",
          }}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          <span>Add Price List</span>
        </Button>
      </div>

      {priceLists.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Price Lists</h3>
            <p className="text-gray-500 max-w-md">
              You haven't created any price lists yet. Click the "Add Price
              List" button to create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {/* Price list cards */}
          {priceLists.map((priceList) => (
            <Card
              key={priceList._id}
              className="overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex flex-col h-[380px] sm:h-[360px] lg:h-[340px] cursor-pointer"
              onClick={() => handleCardClick(priceList)}
            >
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg line-clamp-1">
                  {priceList.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 h-10 text-xs sm:text-sm">
                  {priceList.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden px-4 sm:px-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm font-medium text-gray-500">
                      {priceList.subActivityPrices?.length > 0
                        ? priceList.subActivityPrices.length + " items"
                        : "No items added yet"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(priceList.effectiveFrom)} -{" "}
                      {formatDate(priceList.effectiveTo)}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="font-medium">Sample Items:</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                      {priceList.subActivityPrices &&
                      priceList.subActivityPrices.length > 0 ? (
                        <>
                          {priceList.subActivityPrices
                            .slice(0, 2)
                            .map((item, index) => (
                              <li
                                key={index}
                                className="flex justify-between items-center gap-2 p-2 bg-gray-50 rounded"
                              >
                                <span className="truncate flex-1 min-w-0">
                                  {getSubActivityName(
                                    typeof item.subActivity === "string"
                                      ? item.subActivity
                                      : item.subActivity._id
                                  )}
                                </span>
                                <span className="font-medium text-green-600 whitespace-nowrap">
                                  $
                                  {item.basePrice?.toFixed(2) ||
                                    item.cost?.toFixed(2)}
                                </span>
                              </li>
                            ))}
                          {priceList.subActivityPrices.length > 2 && (
                            <li className="text-blue-600 text-xs text-center py-1">
                              + {priceList.subActivityPrices.length - 2} more
                              items
                            </li>
                          )}
                        </>
                      ) : (
                        <li className="text-gray-400 italic text-xs text-center py-4">
                          No items added yet
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2 pb-4 mt-auto border-t px-4 sm:px-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(priceList);
                  }}
                  disabled={loading}
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm text-red-500 hover:text-red-600 hover:border-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteConfirmation(priceList);
                  }}
                  disabled={loading}
                >
                  <Trash className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Add price list card */}
          {priceLists.length > 0 && (
            <Card
              className="flex flex-col items-center justify-center h-[340px] border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setModalOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <div
                  className="rounded-full p-4 mb-4"
                  style={{ backgroundColor: "#e3f2fd" }}
                >
                  <Plus className="h-8 w-8" style={{ color: "#1e88e5" }} />
                </div>
                <h3 className="text-lg font-medium mb-2">Add Price List</h3>
                <p className="text-gray-500 max-w-[200px]">
                  Create a new price list for activities and services
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Price List Modal */}
      <AddPriceListDialog
        open={modalOpen}
        onOpenChange={onOpenChange}
        handleCheckboxChange={handleCheckboxChange}
        handleCostChange={handleCostChange}
        handlePriceChange={handlePriceChange}
        handlePricingMethodChange={handlePricingMethodChange}
        selectedSubActivities={selectedSubActivities}
        subActivitiesAvailable={subActivities.length > 0}
      />

      {/* Edit Price List Modal */}
      <EditPriceListDialog
        open={editModalOpen}
        onOpenChange={onOpenChange}
        priceList={editingPriceList as PriceList}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePriceListDialog
        open={deleteConfirmOpen}
        onOpenChange={onOpenChange}
        deletingPriceList={deletingPriceList as PriceList}
      />
    </div>
  );
}
