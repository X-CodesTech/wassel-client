import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Edit, Trash, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetPriceLists,
  actAddPriceList,
  actUpdatePriceList,
  actDeletePriceList,
  clearError,
} from "@/store/priceLists";
import { useLocation } from "wouter";
import { PriceList, PricingMethod } from "@/services/priceListServices";
import { SubActivity } from "@/types/types";

// Form schema for price list
const priceListFormSchema = z.object({
  name: z.string().min(1, "Price list name (English) is required"),
  nameAr: z.string().min(1, "Price list name (Arabic) is required"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  effectiveFrom: z.string().min(1, "Effective from date is required"),
  effectiveTo: z.string().min(1, "Effective to date is required"),
  isActive: z.boolean(),
  subActivityPrices: z
    .array(
      z.object({
        subActivity: z.string().min(1, "Sub-activity is required"),
        pricingMethod: z.enum(["perItem", "perLocation"]),
        basePrice: z.number().min(0, "Base price must be positive").optional(),
        cost: z.number().min(0, "Cost must be positive"),
        locationPrices: z
          .array(
            z.object({
              location: z.string().min(1, "Location is required"),
              price: z.number().min(0, "Location price must be positive"),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

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

  // Initialize form for adding new price list
  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
      subActivityPrices: [],
    },
  });

  // Initialize edit form for editing existing price list
  const editForm = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      effectiveFrom: "",
      effectiveTo: "",
      isActive: true,
      subActivityPrices: [],
    },
  });

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
                activity: embeddedSubActivity.activity?._id || "",
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

  // Handle form submission
  const onSubmit = async (data: PriceListFormValues) => {
    try {
      const priceListData: PriceList = {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description || "",
        descriptionAr: data.descriptionAr || "",
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        isActive: data.isActive,
        subActivityPrices:
          data.subActivityPrices?.map((subActivityPrice) => ({
            subActivity: subActivityPrice.subActivity,
            pricingMethod: subActivityPrice.pricingMethod,
            basePrice: subActivityPrice.basePrice,
            cost: subActivityPrice.cost,
            locationPrices: subActivityPrice.locationPrices,
          })) || [],
      };

      await dispatch(actAddPriceList(priceListData)).unwrap();

      // Reset form and close modal
      form.reset();
      setModalOpen(false);

      // Reset selected sub-activities
      setSelectedSubActivities((prev) =>
        prev.map((item) => ({
          ...item,
          selected: false,
          price: "0.00",
          cost: "0.00",
        }))
      );

      toast({
        title: "Price List Created",
        description: `"${data.name}" has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create price list:", error);
      toast({
        title: "Error",
        description: "Failed to create price list. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit form submission
  const onEditSubmit = async (data: PriceListFormValues) => {
    console.log("Edit form data:", data);
    if (!editingPriceList?._id) {
      console.error("No editing price list ID found");
      return;
    }
    console.log("Processing edit for price list:", editingPriceList._id);

    try {
      const priceListData: PriceList = {
        _id: editingPriceList._id,
        name: data.name,
        nameAr: data.nameAr,
        description: data.description || "",
        descriptionAr: data.descriptionAr || "",
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        isActive: data.isActive,
        subActivityPrices:
          data.subActivityPrices?.map((subActivityPrice) => ({
            subActivity: subActivityPrice.subActivity,
            pricingMethod: subActivityPrice.pricingMethod,
            basePrice: subActivityPrice.basePrice,
            cost: subActivityPrice.cost,
            locationPrices: subActivityPrice.locationPrices,
          })) || [],
      };

      console.log("Sending update request with data:", priceListData);

      await dispatch(
        actUpdatePriceList({
          id: editingPriceList._id,
          priceList: priceListData,
        })
      ).unwrap();

      // Reset form and close modal
      editForm.reset();
      setEditModalOpen(false);
      setEditingPriceList(null);

      toast({
        title: "Price List Updated",
        description: `"${data.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update price list:", error);
      toast({
        title: "Error",
        description: "Failed to update price list. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle delete price list
  const handleDeletePriceList = async () => {
    if (!deletingPriceList?._id) return;

    try {
      await dispatch(actDeletePriceList(deletingPriceList._id)).unwrap();

      setDeleteConfirmOpen(false);
      setDeletingPriceList(null);

      toast({
        title: "Price List Deleted",
        description: `"${deletingPriceList.name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete price list:", error);
      toast({
        title: "Error",
        description: "Failed to delete price list. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  // Handle form submission with sub-activity data
  const handleFormSubmit = form.handleSubmit(
    (data) => {
      // Get selected items with their prices for subActivityPrices
      const selectedSubActivityPrices = selectedSubActivities
        .filter((item) => item.selected)
        .map((item) => ({
          subActivity: item.id,
          pricingMethod: item.pricingMethod,
          basePrice: parseFloat(item.price) || 0,
          cost: parseFloat(item.cost) || 0,
        }));

      // Check if any sub-activities are selected
      if (selectedSubActivityPrices.length === 0) {
        toast({
          title: "No Sub-Activities Selected",
          description:
            "Please select at least one sub-activity to create a price list.",
          variant: "destructive",
        });
        return;
      }

      // Create the final data with selected sub-activities
      const finalData = {
        ...data,
        subActivityPrices: selectedSubActivityPrices,
      };

      // Submit the form with the complete data
      onSubmit(finalData);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      const errorMessages = Object.values(errors)
        .map((error: any) => error?.message)
        .filter(Boolean)
        .join(", ");

      toast({
        title: "Validation Error",
        description:
          errorMessages || "Please check the form and fix any errors.",
        variant: "destructive",
      });
    }
  );

  // Handle edit form submission with sub-activity data
  const handleEditFormSubmit = editForm.handleSubmit(
    (data) => {
      console.log("Form submitted with data:", data);
      console.log("Form errors:", editForm.formState.errors);
      // For edit form, we can get the values directly since they're already populated
      onEditSubmit(data);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      const errorMessages = Object.values(errors)
        .map((error: any) => error?.message)
        .filter(Boolean)
        .join(", ");

      toast({
        title: "Validation Error",
        description:
          errorMessages || "Please check the form and fix any errors.",
        variant: "destructive",
      });
    }
  );

  // Open edit modal
  const openEditModal = (priceList: PriceList) => {
    setEditingPriceList(priceList);

    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    editForm.reset({
      name: priceList.name,
      nameAr: priceList.nameAr,
      description: priceList.description,
      descriptionAr: priceList.descriptionAr,
      effectiveFrom: formatDateForInput(priceList.effectiveFrom),
      effectiveTo: formatDateForInput(priceList.effectiveTo),
      isActive: priceList.isActive,
      subActivityPrices:
        priceList.subActivityPrices?.map((item) => ({
          subActivity:
            typeof item.subActivity === "string"
              ? item.subActivity
              : item.subActivity._id,
          pricingMethod: item.pricingMethod,
          basePrice: item.basePrice,
          cost: item.cost,
          locationPrices: item.locationPrices,
        })) || [],
    });
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            Add New Bilingual Price List
            <DialogTitle></DialogTitle>
            <DialogDescription>
              Create a comprehensive price list with English and Arabic support,
              date ranges, and flexible pricing methods.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price List Name (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter price list name in English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price List Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل اسم قائمة الأسعار بالعربية"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter description in English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل الوصف بالعربية"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When this price list becomes active
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective To</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When this price list expires
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable this price list immediately
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  Select Sub-Activities and Set Pricing
                </h4>
                {subActivities.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-gray-500">
                      No sub-activities available. Create a price list first to
                      see available activities.
                    </span>
                  </div>
                ) : (
                  <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 w-8"></th>
                          <th className="text-left py-2 px-2">Activity</th>
                          <th className="text-left py-2 px-2 w-32">
                            Pricing Method
                          </th>
                          <th className="text-left py-2 px-2 w-32">
                            Base Price ($)
                          </th>
                          <th className="text-left py-2 px-2 w-32">Cost ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubActivities.map((item) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-2 px-2">
                              <Checkbox
                                checked={item.selected}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(
                                    item.id,
                                    checked === true
                                  )
                                }
                              />
                            </td>
                            <td className="py-2 px-2">{item.name}</td>
                            <td className="py-2 px-2">
                              <Select
                                disabled={!item.selected}
                                value={item.pricingMethod}
                                onValueChange={(value: PricingMethod) =>
                                  handlePricingMethodChange(item.id, value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="perItem">
                                    Per Item
                                  </SelectItem>
                                  <SelectItem value="perLocation">
                                    Per Location
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.price}
                                onChange={(e) =>
                                  handlePriceChange(item.id, e.target.value)
                                }
                                disabled={!item.selected}
                                className="h-8"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.cost}
                                onChange={(e) =>
                                  handleCostChange(item.id, e.target.value)
                                }
                                disabled={!item.selected}
                                className="h-8"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#1e88e5",
                    color: "white",
                    border: "none",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Price List"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Price List Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bilingual Price List</DialogTitle>
            <DialogDescription>
              Update your comprehensive price list with English and Arabic
              support, date ranges, and flexible pricing methods.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={handleEditFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price List Name (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter price list name in English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price List Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل اسم قائمة الأسعار بالعربية"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter description in English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل الوصف بالعربية"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When this price list becomes active
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="effectiveTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective To</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        When this price list expires
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable this price list immediately
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  Current Sub-Activities and Pricing
                </h4>
                <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
                  {editingPriceList &&
                  editingPriceList.subActivityPrices &&
                  editingPriceList.subActivityPrices.length > 0 ? (
                    <div className="space-y-2">
                      {editingPriceList.subActivityPrices.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {getSubActivityName(
                              typeof item.subActivity === "string"
                                ? item.subActivity
                                : item.subActivity._id
                            )}
                          </span>
                          <div className="flex gap-4">
                            <span className="font-medium text-green-600">
                              Price: ${item.basePrice?.toFixed(2) || "0.00"}
                            </span>
                            <span className="font-medium text-blue-600">
                              Cost: ${item.cost?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No sub-activities configured for this price list.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#1e88e5",
                    color: "white",
                    border: "none",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Price List"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the price list "
              {deletingPriceList?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeletePriceList}
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
    </div>
  );
}
